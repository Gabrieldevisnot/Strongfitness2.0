"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import Link from "next/link";
import { ArrowLeft, Lock, MapPin, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, total } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = Endereço, 2 = Pagamento

  // Proteção de Rota
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Se não tá logado, vai pro login e volta pra cá depois
        router.push("/login?redirect=/checkout");
      } else if (items.length === 0) {
        // Se carrinho tá vazio, volta pra home
        router.push("/");
      }
    }
  }, [user, items, authLoading, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando checkout...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 pb-20">
      {/* Header Simples do Checkout */}
      <header className="border-b border-white/10 bg-[#141414] py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link href="/carrinho" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar ao Carrinho
          </Link>
          <div className="flex items-center gap-2 text-white font-bold">
            <Lock size={16} className="text-green-500" /> Checkout Seguro
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA DA ESQUERDA: Passos (Endereço/Pagamento) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Indicador de Passos */}
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

          {/* Conteúdo Dinâmico */}
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
            {step === 1 ? (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="text-accent" /> Endereço de Entrega
                </h2>
                <p className="text-gray-400 mb-6">Onde devemos entregar seus equipamentos?</p>
                
                {/* AQUI ENTRARÁ O FORMULÁRIO DEPOIS */}
                <div className="p-10 border-2 border-dashed border-white/10 rounded-lg text-center text-gray-500">
                  Formulário de Endereço em construção...
                </div>

                <button 
                  onClick={() => setStep(2)} 
                  className="mt-6 w-full bg-accent hover:bg-red-700 text-white py-3 rounded-lg font-bold transition"
                >
                  Continuar para Pagamento
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="text-accent" /> Pagamento
                </h2>
                <p className="text-gray-400">Integração de pagamento em breve.</p>
                <button 
                  onClick={() => setStep(1)} 
                  className="mt-4 text-sm text-gray-400 hover:text-white underline"
                >
                  Voltar para Endereço
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DA DIREITA: Resumo do Pedido */}
        <div className="lg:col-span-1">
          <div className="bg-[#141414] border border-white/10 rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-white mb-4">Resumo do Pedido</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-800 rounded bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }}></div>
                  <div className="flex-1">
                    <p className="text-white line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 text-xs">Qtd: {item.quantity} {item.selectedSize && `| Tam: ${item.selectedSize}`}</p>
                  </div>
                  <div className="text-gray-300">
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
                <span className="text-green-500">Grátis</span>
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