"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  LogOut, Plus, Edit, Trash2, Search, X, Save, Loader2, Image as ImageIcon 
} from "lucide-react";
import Image from "next/image";

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ProductImage {
  id?: number;
  url: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string; 
  description: string;
  sizes: string[]; // <--- NOVO CAMPO
  product_images?: ProductImage[];
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  
  // Estado auxiliar para o input de texto dos tamanhos
  const [sizesInput, setSizesInput] = useState(""); 

  const [galleryPreview, setGalleryPreview] = useState<string[]>([]); 

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user]);

  async function fetchData() {
    const [p, o, u] = await Promise.all([
      supabase.from("products").select("*, product_images(id, url)").order("id", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*")
    ]);

    if (p.data) setProducts(p.data);
    if (o.data) setOrders(o.data);
    if (u.data) setProfiles(u.data);
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }
      setGalleryPreview(prev => [...prev, ...newUrls]);
    } catch (error) {
      alert('Erro ao fazer upload.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  function removeImageFromGallery(indexToRemove: number) {
    setGalleryPreview(prev => prev.filter((_, idx) => idx !== indexToRemove));
  }

  async function handleSaveProduct() {
    if (!editingProduct.name) {
      alert("Nome é obrigatório");
      return;
    }

    setUploading(true);

    try {
      const coverImage = galleryPreview.length > 0 ? galleryPreview[0] : (editingProduct.image || "");
      
      // CONVERTER O TEXTO (P, M, G) PARA ARRAY ['P', 'M', 'G']
      // 1. Separa por vírgula
      // 2. Remove espaços em branco (trim)
      // 3. Remove vazios
      const sizesArray = sizesInput.split(',')
        .map(s => s.trim())
        .filter(s => s !== "");

      const payload = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category || "Geral",
        image: coverImage,
        description: editingProduct.description || "",
        sizes: sizesArray // <--- SALVA NO BANCO
      };

      let productId = editingProduct.id;

      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase.from("products").insert([payload]).select().single();
        if (error) throw new Error(error.message);
        productId = data.id;
      }

      // Galeria (Mantém lógica anterior)
      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (galleryPreview.length > 0) {
          const galleryPayload = galleryPreview.map((url, index) => ({
             product_id: productId,
             url: url,
             display_order: index
          }));
          await supabase.from("product_images").insert(galleryPayload);
        }
      }
      
      alert("Produto salvo com sucesso!");
      setIsModalOpen(false);
      await fetchData();
      
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro desconhecido ao salvar.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (confirm("Tem certeza?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    // Prepara o input de tamanhos transformando o array do banco em string "P, M, G"
    setSizesInput(product.sizes ? product.sizes.join(", ") : "");
    
    let images: string[] = [];
    if (product.product_images && product.product_images.length > 0) {
      images = product.product_images.map(pi => pi.url);
    } else if (product.image) {
      images = [product.image];
    }
    setGalleryPreview(images);
    setIsModalOpen(true);
  }

  function openNewModal() {
    setEditingProduct({});
    setSizesInput(""); // Limpa input
    setGalleryPreview([]);
    setIsModalOpen(true);
  }

  // Gráfico (Dados fictícios ou reais se tiver vendas)
  const chartData = {
    labels: orders.length > 0 ? orders.map(o => new Date(o.created_at).toLocaleDateString('pt-BR')).reverse().slice(-7) : ['Hoje'],
    datasets: [{
      label: 'Vendas (R$)',
      data: orders.length > 0 ? orders.map(o => o.total).reverse().slice(-7) : [0],
      borderColor: '#e50914',
      backgroundColor: 'rgba(229, 9, 20, 0.5)',
      tension: 0.4,
    }],
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando...</div>;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      <aside className="w-[260px] bg-[#141414] border-r border-white/10 flex-shrink-0 flex flex-col fixed h-full z-20">
        <div className="p-6">
          <h1 className="font-display font-black text-xl italic text-white tracking-wider">
            STRONG<span className="text-[#e50914]">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'produtos'} onClick={() => setActiveTab('produtos')} icon={<Package size={20}/>} label="Produtos" />
          <NavButton active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')} icon={<ShoppingBag size={20}/>} label="Pedidos" />
          <NavButton active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} icon={<Users size={20}/>} label="Clientes" />
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); router.push('/login'); }} className="w-full flex items-center gap-2 text-gray-400 hover:text-[#e50914] transition px-2 py-2">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[260px] p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Produtos" value={products.length} icon={<Package className="text-[#e50914]" />} />
              <StatCard title="Pedidos" value={orders.length} icon={<ShoppingBag className="text-[#e50914]" />} />
              <StatCard title="Clientes" value={profiles.length} icon={<Users className="text-[#e50914]" />} />
              <StatCard title="Faturamento" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orders.reduce((acc, o) => acc + Number(o.total), 0))} icon={<span className="text-[#e50914] font-bold text-xl">$</span>} />
            </div>
            <div className="bg-[#141414] border border-white/10 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Vendas Recentes</h3>
              <div className="h-[300px] w-full">
                <Line options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }} data={chartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input type="text" placeholder="Buscar..." className="bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#e50914] outline-none w-64" />
              </div>
              <button onClick={openNewModal} className="bg-[#e50914] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
                <Plus size={18} /> Novo Produto
              </button>
            </div>
            <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#121212] text-white uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Estoque/Tamanhos</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#121212] border border-white/10 overflow-hidden relative">
                          <Image src={p.image || "https://placehold.co/100"} alt="" fill className="object-cover" />
                        </div>
                        <span className="font-medium text-white">{p.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        {p.sizes && p.sizes.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                                {p.sizes.map(s => (
                                    <span key={s} className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded">{s}</span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-600 italic">Único</span>
                        )}
                      </td>
                      <td className="px-6 py-3">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button onClick={() => openEditModal(p)} className="p-2 hover:bg-white/10 rounded text-blue-400"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-white/10 rounded text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OUTRAS ABAS (MANTIDAS) */}
        {activeTab === 'pedidos' && <div className="p-4 text-gray-500">Gestão de Pedidos (Em breve)</div>}
        {activeTab === 'clientes' && <div className="p-4 text-gray-500">Gestão de Clientes (Em breve)</div>}
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#141414] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingProduct.id ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Nome</label>
                <input value={editingProduct.name || ""} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" />
              </div>
              
              {/* Preço e Categoria */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Preço</label>
                    <input type="number" value={editingProduct.price || ""} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Categoria</label>
                    <select value={editingProduct.category || ""} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none">
                      <option value="Geral">Geral</option>
                      <option value="Lançamento">Lançamento</option>
                      <option value="Roupas">Roupas</option>
                      <option value="Equipamentos">Equipamentos</option>
                      <option value="Suplementos">Suplementos</option>
                    </select>
                 </div>
              </div>

              {/* CAMPO DE TAMANHOS (NOVO) */}
              <div>
                 <label className="text-xs text-gray-500 uppercase font-bold block mb-1">
                    Tamanhos disponíveis (Separe por vírgula)
                 </label>
                 <input 
                    placeholder="Ex: P, M, G, GG ou 38, 40, 42 (Deixe vazio para tamanho único)"
                    value={sizesInput} 
                    onChange={e => setSizesInput(e.target.value)} 
                    className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" 
                 />
                 <p className="text-[10px] text-gray-500 mt-1">
                    Dica: Se o tamanho "P" acabar, basta apagar ele aqui e salvar.
                 </p>
              </div>

              {/* Galeria */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <label className="text-xs text-gray-500 uppercase font-bold block mb-3">Galeria</label>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {galleryPreview.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                      <Image src={url} alt={`Foto ${idx}`} fill className="object-cover" />
                      <button type="button" onClick={() => removeImageFromGallery(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full z-10 hover:bg-red-700"><X size={14} /></button>
                      {idx === 0 && <span className="absolute bottom-0 w-full bg-accent text-white text-[9px] text-center uppercase font-bold">Capa</span>}
                    </div>
                  ))}
                  <label className={`aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#121212] border-2 border-dashed border-white/10 hover:border-[#e50914] rounded-lg ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    {uploading ? <Loader2 className="animate-spin text-[#e50914]" size={24} /> : <ImageIcon className="text-gray-500" size={24} />}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Descrição</label>
                <textarea value={editingProduct.description || ""} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none h-24 resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSaveProduct} disabled={uploading} className="bg-[#e50914] hover:bg-red-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2 transition disabled:opacity-50">
                {uploading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: any) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? "bg-[#e50914] text-white" : "text-gray-400 hover:bg-white/5"}`}>{icon} <span>{label}</span></button>;
}

function StatCard({ title, value, icon }: any) {
  return <div className="bg-[#141414] border border-white/10 p-6 rounded-xl flex items-center gap-4"><div className="p-3 bg-white/5 rounded-full">{icon}</div><div><p className="text-sm text-gray-500 font-bold uppercase">{title}</p><p className="text-2xl font-bold text-white">{value}</p></div></div>;
}