"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, Plus, Search, Loader2, CheckCircle, Trash2 } from "lucide-react";

interface Address {
  id: number;
  recipient_name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface AddressFormProps {
  onSelectAddress: (address: Address) => void;
  userId: string;
}

export default function AddressForm({ onSelectAddress, userId }: AddressFormProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    recipient_name: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  // 1. Carregar endereços salvos ao iniciar
  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  async function fetchAddresses() {
    setLoading(true);
    const { data } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setAddresses(data);
      // Se tiver endereços, seleciona o primeiro automaticamente
      if (data.length > 0) {
        setSelectedId(data[0].id);
        onSelectAddress(data[0]);
      } else {
        // Se não tiver, abre o formulário de novo
        setIsAddingNew(true);
      }
    }
    setLoading(false);
  }

  // 2. Buscar CEP (ViaCEP)
  async function handleCepBlur() {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    }
  }

  // 3. Salvar Novo Endereço
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("user_addresses").insert([{
      user_id: userId,
      ...formData
    }]);

    if (!error) {
      await fetchAddresses(); // Recarrega lista
      setIsAddingNew(false);  // Fecha form
      // Limpa form
      setFormData({ recipient_name: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
    } else {
      alert("Erro ao salvar endereço.");
    }
    setSaving(false);
  }

  // 4. Selecionar Endereço da Lista
  function handleSelect(address: Address) {
    setSelectedId(address.id);
    onSelectAddress(address);
  }

  async function handleDelete(id: number) {
    if(!confirm("Remover este endereço?")) return;
    await supabase.from("user_addresses").delete().eq("id", id);
    fetchAddresses();
  }

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2"/> Carregando endereços...</div>;

  return (
    <div className="space-y-6">
      
      {/* LISTA DE ENDEREÇOS SALVOS */}
      {!isAddingNew && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div 
              key={addr.id}
              onClick={() => handleSelect(addr)}
              className={`
                relative p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4
                ${selectedId === addr.id 
                  ? "border-accent bg-accent/5" 
                  : "border-white/10 bg-[#1e1e1e] hover:border-white/30"
                }
              `}
            >
              <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedId === addr.id ? "border-accent" : "border-gray-500"}`}>
                {selectedId === addr.id && <div className="w-2.5 h-2.5 bg-accent rounded-full" />}
              </div>
              
              <div className="flex-1">
                <p className="font-bold text-white">{addr.recipient_name}</p>
                <p className="text-sm text-gray-400">
                  {addr.street}, {addr.number} {addr.complement && ` - ${addr.complement}`}
                </p>
                <p className="text-sm text-gray-400">
                  {addr.neighborhood} - {addr.city}/{addr.state}
                </p>
                <p className="text-xs text-gray-500 mt-1">CEP: {addr.cep}</p>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                className="text-gray-500 hover:text-red-500 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button 
            onClick={() => setIsAddingNew(true)}
            className="w-full py-3 border border-dashed border-white/20 text-gray-400 rounded-xl hover:border-white/50 hover:text-white transition flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Adicionar Novo Endereço
          </button>
        </div>
      )}

      {/* FORMULÁRIO DE NOVO ENDEREÇO */}
      {(isAddingNew || addresses.length === 0) && (
        <form onSubmit={handleSave} className="bg-[#1e1e1e] border border-white/10 p-6 rounded-xl space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white">Novo Endereço</h3>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setIsAddingNew(false)} className="text-xs text-gray-400 hover:text-white underline">
                Cancelar
              </button>
            )}
          </div>

          <div>
             <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nome do Destinatário</label>
             <input required value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" placeholder="Ex: Gabriel" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">CEP</label>
                <div className="relative">
                    <input required value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} onBlur={handleCepBlur} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" placeholder="00000-000" />
                    <Search className="absolute right-3 top-2.5 text-gray-600" size={16}/>
                </div>
             </div>
             <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Estado (UF)</label>
                <input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-2">
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Cidade</label>
                <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" />
             </div>
             <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Bairro</label>
                <input required value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
             <div className="col-span-3">
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Rua / Logradouro</label>
                <input required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" />
             </div>
             <div>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Número</label>
                <input required value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" />
             </div>
          </div>

          <div>
             <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Complemento (Opcional)</label>
             <input value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} className="w-full bg-[#141414] border border-white/10 rounded px-4 py-2 text-white focus:border-accent outline-none" placeholder="Ex: Apto 101" />
          </div>

          <button disabled={saving} type="submit" className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
            Salvar Endereço
          </button>
        </form>
      )}
    </div>
  );
}