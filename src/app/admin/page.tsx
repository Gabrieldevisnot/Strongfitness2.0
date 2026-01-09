"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  LogOut, Plus, Edit, Trash2, Search, X, Save, Loader2, Image as ImageIcon, Menu 
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
  sizes: string[];
  product_images?: ProductImage[];
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // ESTADO PARA MENU MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [sizesInput, setSizesInput] = useState(""); 
  const [galleryPreview, setGalleryPreview] = useState<string[]>([]); 

  useEffect(() => {
    // Proteção de Rota (Descomente se já tiver auth configurada para bloquear)
    // if (!user || user.role !== 'admin') { router.push("/login"); return; }
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

  // --- FUNÇÕES DE UPLOAD E SALVAR (MANTIDAS IGUAIS) ---
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
    } catch (error) { alert('Erro ao fazer upload.'); console.error(error); } finally { setUploading(false); }
  }

  function removeImageFromGallery(indexToRemove: number) {
    setGalleryPreview(prev => prev.filter((_, idx) => idx !== indexToRemove));
  }

  async function handleSaveProduct() {
    if (!editingProduct.name) { alert("Nome é obrigatório"); return; }
    setUploading(true);
    try {
      const coverImage = galleryPreview.length > 0 ? galleryPreview[0] : (editingProduct.image || "");
      const sizesArray = sizesInput.split(',').map(s => s.trim()).filter(s => s !== "");

      const payload = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category || "Geral",
        image: coverImage,
        description: editingProduct.description || "",
        sizes: sizesArray
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

      if (productId) {
        await supabase.from("product_images").delete().eq("product_id", productId);
        if (galleryPreview.length > 0) {
          const galleryPayload = galleryPreview.map((url, index) => ({
             product_id: productId, url: url, display_order: index
          }));
          await supabase.from("product_images").insert(galleryPayload);
        }
      }
      alert("Produto salvo!"); setIsModalOpen(false); await fetchData();
    } catch (err: any) { console.error(err); alert(err.message); } finally { setUploading(false); }
  }

  async function handleDeleteProduct(id: number) {
    if (confirm("Tem certeza?")) { await supabase.from("products").delete().eq("id", id); fetchData(); }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
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
    setEditingProduct({}); setSizesInput(""); setGalleryPreview([]); setIsModalOpen(true);
  }

  const chartData = {
    labels: orders.length > 0 ? orders.map(o => new Date(o.created_at).toLocaleDateString('pt-BR')).reverse().slice(-7) : ['Hoje'],
    datasets: [{ label: 'Vendas (R$)', data: orders.length > 0 ? orders.map(o => o.total).reverse().slice(-7) : [0], borderColor: '#e50914', backgroundColor: 'rgba(229, 9, 20, 0.5)', tension: 0.4 }],
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Carregando...</div>;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200 font-sans relative">
      
      {/* --- OVERLAY MOBILE (Fundo escuro quando menu abre) --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Responsiva) --- */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-[#141414] border-r border-white/10 flex flex-col transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="font-display font-black text-xl italic text-white tracking-wider">
            STRONG<span className="text-[#e50914]">ADMIN</span>
          </h1>
          {/* Botão fechar só no mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavButton active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
          <NavButton active={activeTab === 'produtos'} onClick={() => { setActiveTab('produtos'); setIsMobileMenuOpen(false); }} icon={<Package size={20}/>} label="Produtos" />
          <NavButton active={activeTab === 'pedidos'} onClick={() => { setActiveTab('pedidos'); setIsMobileMenuOpen(false); }} icon={<ShoppingBag size={20}/>} label="Pedidos" />
          <NavButton active={activeTab === 'clientes'} onClick={() => { setActiveTab('clientes'); setIsMobileMenuOpen(false); }} icon={<Users size={20}/>} label="Clientes" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); router.push('/login'); }} className="w-full flex items-center gap-2 text-gray-400 hover:text-[#e50914] transition px-2 py-2">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 md:ml-[260px] p-4 md:p-8 min-w-0">
        {/* Header Mobile com Botão Menu */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white capitalize">{activeTab}</h2>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-[#141414] border border-white/10 rounded-lg text-white">
                <Menu size={24} />
            </button>
        </div>

        {/* Header Desktop */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Grid ajustado para mobile (1 coluna) -> tablet (2 colunas) -> desktop (4 colunas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard title="Produtos" value={products.length} icon={<Package className="text-[#e50914]" />} />
              <StatCard title="Pedidos" value={orders.length} icon={<ShoppingBag className="text-[#e50914]" />} />
              <StatCard title="Clientes" value={profiles.length} icon={<Users className="text-[#e50914]" />} />
              <StatCard title="Faturamento" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orders.reduce((acc, o) => acc + Number(o.total), 0))} icon={<span className="text-[#e50914] font-bold text-xl">$</span>} />
            </div>
            
            <div className="bg-[#141414] border border-white/10 p-4 md:p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Vendas Recentes</h3>
              <div className="h-[250px] md:h-[300px] w-full">
                <Line options={{ maintainAspectRatio: false, responsive: true, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }} data={chartData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input type="text" placeholder="Buscar..." className="w-full bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#e50914] outline-none" />
              </div>
              <button onClick={openNewModal} className="bg-[#e50914] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition w-full md:w-auto">
                <Plus size={18} /> Novo Produto
              </button>
            </div>

            {/* Container com scroll horizontal para tabelas no mobile */}
            <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
                    <thead className="bg-[#121212] text-white uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4">Estoque</th>
                        <th className="px-6 py-4">Preço</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 flex-shrink-0 rounded bg-[#121212] border border-white/10 overflow-hidden relative">
                                <Image src={p.image || "https://placehold.co/100"} alt="" fill className="object-cover" />
                            </div>
                            <span className="font-medium text-white truncate max-w-[150px]">{p.name}</span>
                        </td>
                        <td className="px-6 py-3">
                            {p.sizes && p.sizes.length > 0 ? (
                                <div className="flex gap-1 flex-wrap max-w-[150px]">
                                    {p.sizes.map(s => (
                                        <span key={s} className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded">{s}</span>
                                    ))}
                                </div>
                            ) : (<span className="text-gray-600 italic">Único</span>)}
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
          </div>
        )}

        {/* OUTRAS ABAS */}
        {activeTab === 'pedidos' && <div className="p-4 text-gray-500 text-center">Gestão de Pedidos (Em breve)</div>}
        {activeTab === 'clientes' && <div className="p-4 text-gray-500 text-center">Gestão de Clientes (Em breve)</div>}
      </main>

      {/* --- MODAL (Responsivo) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
          {/* w-[95%] para mobile e max-w-2xl para desktop */}
          <div className="bg-[#141414] border border-white/10 w-[95%] md:w-full md:max-w-2xl rounded-xl shadow-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{editingProduct.id ? "Editar Produto" : "Novo Produto"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Nome</label>
                <input value={editingProduct.name || ""} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                 <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Tamanhos (P, M, G...)</label>
                 <input placeholder="Ex: P, M, G" value={sizesInput} onChange={e => setSizesInput(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" />
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <label className="text-xs text-gray-500 uppercase font-bold block mb-3">Galeria</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {galleryPreview.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/20 group">
                      <Image src={url} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => removeImageFromGallery(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full z-10"><X size={12} /></button>
                    </div>
                  ))}
                  <label className={`aspect-square flex items-center justify-center cursor-pointer bg-[#121212] border-2 border-dashed border-white/10 hover:border-[#e50914] rounded-lg ${uploading ? 'opacity-50' : ''}`}>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    {uploading ? <Loader2 className="animate-spin text-[#e50914]" size={20} /> : <ImageIcon className="text-gray-500" size={20} />}
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
                {uploading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Salvar
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
  return <div className="bg-[#141414] border border-white/10 p-4 rounded-xl flex items-center gap-4"><div className="p-3 bg-white/5 rounded-full">{icon}</div><div><p className="text-xs text-gray-500 font-bold uppercase">{title}</p><p className="text-xl md:text-2xl font-bold text-white">{value}</p></div></div>;
}