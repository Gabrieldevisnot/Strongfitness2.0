"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import Link from "next/link";
import { ArrowLeft, Lock, MapPin, CreditCard } from "lucide-react";
import AddressForm from "@/components/checkout/AddressForm"; // <--- IMPORT NOVO

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, total } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<any>(null); // <--- ESTADO DO ENDEREÇO

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login?redirect=/checkout");
      else if (items.length === 0) router.push("/");
    }
  }, [user, items, authLoading, router]);

  if (authLoading || !user) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 pb-20">
      <header className="border-b border-white/10 bg-[#141414] py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link href="/carrinho" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-white font-bold text-sm md:text-base">
            <Lock size={16} className="text-green-500" /> Compra 100% Segura
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        
        {/* ESQUERDA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stepper */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-white" : "text-gray-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-accent" : "bg-gray-800"}`}>1</div>
              <span className="font-bold">Endereço</span>
            </div>
            <div className="w-10 h-[1px] bg-gray-800"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-white" : "text-gray-600"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-accent" : "bg-gray-800"}`}>2</div>
              <span className="font-bold">Pagamento</span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
            {step === 1 ? (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <MapPin className="text-accent" /> Endereço de Entrega
                </h2>
                <p className="text-gray-400 mb-6 text-sm">Selecione um endereço salvo ou cadastre um novo.</p>
                
                {/* COMPONENTE DE ENDEREÇO */}
                <AddressForm 
                  userId={user.id} 
                  onSelectAddress={(addr) => setSelectedAddress(addr)} 
                />

                <button 
                  onClick={() => {
                    if (selectedAddress) setStep(2);
                    else alert("Por favor, selecione ou cadastre um endereço.");
                  }}
                  disabled={!selectedAddress}
                  className={`
                    mt-8 w-full py-4 rounded-lg font-bold text-lg transition uppercase tracking-wide
                    ${selectedAddress 
                      ? "bg-accent hover:bg-red-700 text-white" 
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"}
                  `}
                >
                  Ir para Pagamento
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="text-accent" /> Pagamento
                </h2>
                
                {/* Resumo do endereço escolhido */}
                <div className="bg-[#1e1e1e] p-4 rounded-lg mb-6 border border-white/10">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Entregar em:</p>
                    <p className="text-white font-bold">{selectedAddress.street}, {selectedAddress.number}</p>
                    <p className="text-sm text-gray-400">{selectedAddress.neighborhood} - {selectedAddress.city}/{selectedAddress.state}</p>
                </div>

                <div className="p-8 border-2 border-dashed border-white/10 rounded-lg text-center text-gray-500">
                  Próxima etapa: Seleção de PIX ou Cartão.
                </div>
                
                <button 
                  onClick={() => setStep(1)} 
                  className="mt-4 text-sm text-gray-400 hover:text-white underline"
                >
                  Voltar e alterar endereço
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DIREITA (Resumo do Pedido - Mantido igual) */}
        <div className="lg:col-span-1">
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-white mb-4">Resumo do Pedido</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-800 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image})` }}></div>
                  <div className="flex-1">
                    <p className="text-white line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 text-xs mt-1">
                       {item.quantity}x {item.selectedSize && <span className="bg-white/10 px-1 rounded ml-1">{item.selectedSize}</span>}
                    </p>
                  </div>
                  <div className="text-gray-300 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Frete</span>
                <span className="text-green-500 font-bold">GRÁTIS</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10 mt-2">
                <span>Total</span>
                <span className="text-accent">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}