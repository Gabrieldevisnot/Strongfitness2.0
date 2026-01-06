"use client";

import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, CreditCard, Truck } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, login } = useAuth();
  const router = useRouter();
  
  // --- CORREÇÃO DE HIDRATAÇÃO (INÍCIO) ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // --- CORREÇÃO DE HIDRATAÇÃO (FIM) ---

  const [step, setStep] = useState(1); // 1: Login/Morada, 2: Pagamento, 3: Sucesso
  const [loading, setLoading] = useState(false);

  // Redirecionar se carrinho vazio (Só executa se já estiver montado)
  useEffect(() => {
    if (mounted && items.length === 0 && step !== 3) {
      router.push("/");
    }
  }, [items, router, step, mounted]);

  // Se não estiver montado, não renderiza nada para evitar o erro de diferença de texto
  if (!mounted) return null;

  const subtotal = totalPrice();
  const shipping = 19.90;
  const total = subtotal + shipping;

  const handleFinish = () => {
    setLoading(true);
    // Simular processamento de API
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      clearCart();
    }, 2000);
  };

  if (step === 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10 px-4">
        <CheckCircle className="text-success w-20 h-20 mb-6 animate-bounce" />
        <h1 className="text-3xl font-display font-bold text-white mb-2">Pedido Confirmado!</h1>
        <p className="text-muted mb-8 max-w-md">
          Obrigado, <span className="text-white font-bold">{user?.name}</span>. 
          Enviámos um email de confirmação para {user?.email}.
        </p>
        <button 
          onClick={() => router.push("/")}
          className="bg-panel2 border border-border px-8 py-3 rounded-lg text-white hover:bg-white hover:text-black transition font-bold"
        >
          Voltar à Loja
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 grid lg:grid-cols-2 gap-12">
      
      {/* COLUNA DA ESQUERDA: Formulários */}
      <div className="space-y-8">
        
        {/* 1. Identificação */}
        <section className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Identificação
          </h2>
          
          {!user ? (
            <div className="space-y-4">
              <p className="text-muted text-sm">Entre com seu email para continuar.</p>
              <input 
                type="email" 
                placeholder="seu@email.com" 
                className="w-full bg-panel2 border border-border rounded-lg px-4 py-3 text-white focus:border-accent outline-none"
                onBlur={(e) => e.target.value && login(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex justify-between items-center bg-panel2 p-4 rounded-lg border border-border">
              <div>
                <div className="font-bold text-white">{user.name}</div>
                <div className="text-sm text-muted">{user.email}</div>
              </div>
              <button className="text-accent text-sm font-bold">Alterar</button>
            </div>
          )}
        </section>

        {/* 2. Entrega */}
        <section className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Entrega
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="CEP" className="bg-panel2 border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-accent" defaultValue={user?.address?.zip} />
             <input type="text" placeholder="Cidade" className="bg-panel2 border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-accent" defaultValue={user?.address?.city} />
             <input type="text" placeholder="Endereço" className="col-span-2 bg-panel2 border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-accent" defaultValue={user?.address?.street} />
          </div>
        </section>

        {/* 3. Pagamento */}
        <section className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            Pagamento
          </h2>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-accent bg-panel2 text-white transition">
              <span className="font-bold text-sm">PIX</span>
              <span className="text-xs text-success">-5% OFF</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border bg-panel2 text-muted hover:border-white transition">
              <CreditCard size={20} />
              <span className="font-bold text-sm">Cartão</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-border bg-panel2 text-muted hover:border-white transition">
              <span className="font-bold text-sm">Boleto</span>
            </button>
          </div>

          <div className="bg-black p-4 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm text-muted mb-2">QR Code gerado ao finalizar</p>
            <div className="w-32 h-32 bg-white mx-auto mb-2 opacity-50"></div>
          </div>
        </section>

      </div>

      {/* COLUNA DA DIREITA: Resumo */}
      <div className="h-fit sticky top-24">
        <div className="bg-panel border border-border rounded-xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-white mb-4">Resumo do Pedido</h3>
          
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-12 h-12 rounded bg-panel2 overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white line-clamp-1">{item.name}</div>
                  <div className="text-xs text-muted">Qtd: {item.quantity}</div>
                </div>
                <div className="text-sm font-bold text-white">
                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-border pt-4 mb-6 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Entrega</span>
              <span>R$ {shipping.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white mt-2 pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-accent">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            disabled={loading || !user}
            className="w-full bg-success hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? "Processando..." : "CONFIRMAR PAGAMENTO"}
          </button>

          {!user && (
            <p className="text-xs text-center text-error mt-3">
              Preencha sua identificação para continuar.
            </p>
          )}
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <Truck size={14} /> Entrega garantida para todo o Brasil
          </div>
        </div>
      </div>

    </div>
  );
}