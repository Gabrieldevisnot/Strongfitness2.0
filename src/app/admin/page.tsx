"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, 
  LogOut, Plus, Edit, Trash2, Search, X, Save 
} from "lucide-react";
import Image from "next/image";

// Configuração do Gráfico (Chart.js)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Tipos
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Estados de Dados
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Estado do Modal de Produto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Cores do Tema (Baseadas no teu arquivo HTML)
  const colors = {
    bg: "#0a0a0a",
    panel: "#141414",
    panel2: "#121212",
    border: "rgba(255,255,255,0.08)",
    accent: "#e50914"
  };

  // 1. Carregar Dados Reais
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user]);

  async function fetchData() {
    const [p, o, u] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: true }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*")
    ]);

    if (p.data) setProducts(p.data);
    if (o.data) setOrders(o.data);
    if (u.data) setProfiles(u.data);
    setLoading(false);
  }

  // 2. Lógica do Gráfico
  const chartData = {
    labels: orders.map(o => new Date(o.created_at).toLocaleDateString('pt-BR')).reverse().slice(-7), // Últimos 7 pedidos
    datasets: [
      {
        label: 'Vendas (R$)',
        data: orders.map(o => o.total).reverse().slice(-7),
        borderColor: colors.accent,
        backgroundColor: 'rgba(229, 9, 20, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // 3. Funções de Produto (CRUD)
  async function handleSaveProduct() {
    if (!editingProduct) return;

    const payload = {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      category: editingProduct.category || "Geral",
      image: editingProduct.image || "",
      description: editingProduct.description || ""
    };

    if (editingProduct.id) {
      // Editar
      await supabase.from("products").update(payload).eq("id", editingProduct.id);
    } else {
      // Criar
      await supabase.from("products").insert([payload]);
    }
    
    setIsModalOpen(false);
    fetchData(); // Recarrega a tabela
  }

  async function handleDeleteProduct(id: number) {
    if (confirm("Tem certeza que deseja excluir?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando Painel...</div>;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      
      {/* --- SIDEBAR --- */}
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
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">{user?.name?.split(" ")[0]}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/login'); }} className="w-full flex items-center gap-2 text-gray-400 hover:text-[#e50914] transition px-2 py-2">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 ml-[260px] p-8 overflow-y-auto">
        
        {/* HEADER DA PÁGINA */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
          <div className="flex gap-2">
             {/* Botões de ação contextuais podem vir aqui */}
          </div>
        </div>

        {/* --- ABA DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Produtos" value={products.length} icon={<Package className="text-[#e50914]" />} />
              <StatCard title="Pedidos" value={orders.length} icon={<ShoppingBag className="text-[#e50914]" />} />
              <StatCard title="Clientes" value={profiles.length} icon={<Users className="text-[#e50914]" />} />
              <StatCard title="Faturamento" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orders.reduce((acc, o) => acc + Number(o.total), 0))} icon={<span className="text-[#e50914] font-bold text-xl">$</span>} />
            </div>

            {/* Gráfico */}
            <div className="bg-[#141414] border border-white/10 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Vendas Recentes</h3>
              <div className="h-[300px] w-full">
                <Line options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }} data={chartData} />
              </div>
            </div>
          </div>
        )}

        {/* --- ABA PRODUTOS --- */}
        {activeTab === 'produtos' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input type="text" placeholder="Buscar produtos..." className="bg-[#141414] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#e50914] outline-none w-64" />
              </div>
              <button 
                onClick={() => { setEditingProduct({}); setIsModalOpen(true); }}
                className="bg-[#e50914] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
              >
                <Plus size={18} /> Novo Produto
              </button>
            </div>

            <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#121212] text-white uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Imagem</th>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-3">
                        <div className="w-10 h-10 rounded bg-[#121212] border border-white/10 overflow-hidden relative">
                          <Image src={p.image || "https://placehold.co/100"} alt="" fill className="object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium text-white">{p.name}</td>
                      <td className="px-6 py-3">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                      <td className="px-6 py-3">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs text-white">{p.category}</span>
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded text-blue-400"><Edit size={16}/></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-white/10 rounded text-red-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ABA PEDIDOS --- */}
        {activeTab === 'pedidos' && (
          <div className="animate-fadeIn bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
             <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#121212] text-white uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/5">
                      <td className="px-6 py-3">#{o.id}</td>
                      <td className="px-6 py-3 text-white font-bold">{o.customer_name}</td>
                      <td className="px-6 py-3 text-[#e50914] font-bold">R$ {o.total}</td>
                      <td className="px-6 py-3 uppercase text-xs font-bold">{o.status}</td>
                      <td className="px-6 py-3">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

      </main>

      {/* --- MODAL DE PRODUTO --- */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#141414] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProduct.id ? "Editar Produto" : "Novo Produto"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Nome do Produto</label>
                <input 
                  value={editingProduct.name || ""} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Preço (R$)</label>
                    <input 
                      type="number"
                      value={editingProduct.price || ""} 
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                      className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none" 
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Categoria</label>
                    <select 
                       value={editingProduct.category || ""}
                       onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                       className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none"
                    >
                      <option value="geral">Geral</option>
                      <option value="lançamento">Lançamento</option>
                      <option value="roupas">Roupas</option>
                      <option value="equipamentos">Equipamentos</option>
                    </select>
                 </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">URL da Imagem</label>
                <input 
                  value={editingProduct.image || ""} 
                  onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                  className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none text-sm" 
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold block mb-1">Descrição</label>
                <textarea 
                  value={editingProduct.description || ""} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full bg-[#121212] border border-white/10 rounded px-4 py-2 text-white focus:border-[#e50914] outline-none h-24 resize-none" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSaveProduct} className="bg-[#e50914] hover:bg-red-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-componentes para limpar o código principal
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
        active 
        ? "bg-[#e50914] text-white shadow-lg shadow-red-900/20" 
        : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
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