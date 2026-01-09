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
  
  // Estado local para manipular a galeria visualmente antes de salvar
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

  // --- UPLOAD MÚLTIPLO ---
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        // Limpa nome do arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        newUrls.push(data.publicUrl);
      }

      // Adiciona ao preview local
      setGalleryPreview(prev => [...prev, ...newUrls]);

    } catch (error) {
      alert('Erro ao fazer upload.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  // --- REMOVER IMAGEM (Apenas visualmente, o delete real ocorre no Salvar) ---
  function removeImageFromGallery(indexToRemove: number) {
    setGalleryPreview(prev => prev.filter((_, idx) => idx !== indexToRemove));
  }

  // --- SALVAR (CORRIGIDO) ---
  async function handleSaveProduct() {
    if (!editingProduct.name) {
      alert("Nome é obrigatório");
      return;
    }

    setUploading(true); // Bloqueia botão enquanto salva

    try {
      // 1. Define a Capa (sempre a primeira da lista visual)
      // Se não tiver imagens na galeria, tenta manter a antiga ou fica vazio
      const coverImage = galleryPreview.length > 0 ? galleryPreview[0] : "";

      const payload = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category || "Geral",
        image: coverImage, // ATUALIZA A CAPA NA TABELA PRINCIPAL
        description: editingProduct.description || ""
      };

      let productId = editingProduct.id;

      // 2. Salva ou Cria o Produto Principal
      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert([payload]).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // 3. SINCRONIZAR GALERIA (A Mágica acontece aqui)
      if (productId) {
        // A. DELETAR TODAS as imagens antigas desse produto (Resolve duplicidade e remoção)
        await supabase.from("product_images").delete().eq("product_id", productId);

        // B. INSERIR as imagens que estão na tela agora
        if (galleryPreview.length > 0) {
          const galleryPayload = galleryPreview.map((url, index) => ({
             product_id: productId,
             url: url,
             display_order: index
          }));
          
          const { error: galleryError } = await supabase.from("product_images").insert(galleryPayload);
          if (galleryError) throw galleryError;
        }
      }
      
      setIsModalOpen(false);
      await fetchData(); // Recarrega a tabela para mostrar a capa nova
      
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar produto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (confirm("Tem certeza? Isso apagará o produto.")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    
    // Carrega imagens para o preview.
    // Prioridade: Imagens da tabela nova. Se não tiver, usa a capa antiga.
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
    setGalleryPreview([]);
    setIsModalOpen(true);
  }

  // Dados do Gráfico
  const chartData = {
    labels: orders.map(o => new Date(o.created_at).toLocaleDateString('pt-BR')).reverse().slice(-7),
    datasets: [{
      label: 'Vendas (R$)',
      data: orders.map(o => o.total).reverse().slice(-7),
      borderColor: '#e50914',
      backgroundColor: 'rgba(229, 9, 20, 0.5)',
      tension: 0.4,
    }],
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando...</div>;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      {/* SIDEBAR */}
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

      {/* CONTEÚDO */}
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
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4">Categoria</th>
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
                        {(p.product_images?.length || 0) > 0 && (
                          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 ml-2">
                             +{p.product_images?.length} fotos
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                      <td className="px-6 py-3"><span className="bg-white/10 px-2 py-1 rounded text-xs text-white">{p.category}</span></td>
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

        {/* ... (Outras abas mantidas) ... */}
        {activeTab === 'pedidos' && (
          <div className="animate-fadeIn bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
             <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#121212] text-white uppercase font-bold text-xs">
                  <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/5">
                      <td className="px-6 py-3">#{o.id}</td>
                      <td className="px-6 py-3 text-white font-bold">{o.customer_name}</td>
                      <td className="px-6 py-3 text-[#e50914] font-bold">R$ {o.total}</td>
                      <td className="px-6 py-3 uppercase text-xs font-bold">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'clientes' && (
           <div className="animate-fadeIn p-4 text-center text-gray-500">
             Gestão de Clientes em breve. Total cadastrados: <strong className="text-white">{profiles.length}</strong>
           </div>
        )}
      </main>

      {/* --- MODAL DE PRODUTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#141414] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingProduct.id ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="space-y-4">
              {/* Campos Básicos */}
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Nome</label>
                <input value={editingProduct.name || ""} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Preço</label>
                    <input type="number" value={editingProduct.price || ""} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Categoria</label>
                    <select value={editingProduct.category || ""} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none">
                      <option value="geral">Geral</option>
                      <option value="lançamento">Lançamento</option>
                      <option value="roupas">Roupas</option>
                      <option value="equipamentos">Equipamentos</option>
                    </select>
                 </div>
              </div>

              {/* ÁREA DE GALERIA */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <label className="text-xs text-gray-500 uppercase font-bold block mb-3">Galeria de Imagens</label>
                
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {galleryPreview.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                      <Image src={url} alt={`Foto ${idx}`} fill className="object-cover" />
                      
                      {/* BOTÃO REMOVER CORRIGIDO */}
                      <button 
                        type="button"
                        onClick={() => removeImageFromGallery(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-md hover:bg-red-700 transition z-10"
                        title="Remover foto"
                      >
                        <X size={14} />
                      </button>

                      {idx === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-accent text-white text-[9px] font-bold text-center py-1 uppercase z-10">
                          Capa Principal
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Upload */}
                  <label className={`aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#121212] border-2 border-dashed border-white/10 hover:border-[#e50914] hover:bg-white/5 transition rounded-lg ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    {uploading ? (
                      <Loader2 className="animate-spin text-[#e50914]" size={24} />
                    ) : (
                      <>
                        <ImageIcon className="text-gray-500" size={24} />
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Add Fotos</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Descrição</label>
                <textarea value={editingProduct.description || ""} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none h-24 resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancelar</button>
              <button onClick={handleSaveProduct} disabled={uploading} className="bg-[#e50914] hover:bg-red-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2 disabled:opacity-50 transition shadow-lg shadow-red-900/20">
                {uploading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${active ? "bg-[#e50914] text-white shadow-lg shadow-red-900/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-[#141414] border border-white/10 p-6 rounded-xl flex items-center gap-4 hover:border-[#e50914]/50 transition duration-300">
      <div className="p-3 bg-white/5 rounded-full">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-bold uppercase">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}