"use client";

import { useState } from "react";
import { CreditCard, QrCode, CheckCircle, Loader2, Lock } from "lucide-react";
import { useCart } from "@/store/useCart";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface PaymentStepProps {
  address: any;
  onBack: () => void;
  userId: string;
}

export default function PaymentStep({ address, onBack, userId }: PaymentStepProps) {
  const { items, total, clearCart } = useCart();
  const [method, setMethod] = useState<"pix" | "credit_card">("pix");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- CORREÇÃO DE SEGURANÇA ---
  // Se o endereço vier nulo por algum delay, mostramos carregando em vez de quebrar
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400 animate-fadeIn">
        <Loader2 className="animate-spin mb-4" />
        <p>Carregando informações do endereço...</p>
        <button onClick={onBack} className="text-accent hover:underline mt-2 text-sm">
          Voltar para seleção de endereço
        </button>
      </div>
    );
  }

  async function handleFinishOrder() {
    setLoading(true);

    try {
      // 1. Criar o Pedido (Header)
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: userId,
          total: total,
          status: "pending",
          payment_method: method,
          address_snapshot: address // Salva o endereço como JSON
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Criar os Itens do Pedido
      const itemsPayload = items.map(item => ({
        order_id: order.id,
        product_id: item.originalId || item.id, // Garante ID numérico
        quantity: item.quantity,
        price: item.price,
        selected_size: item.selectedSize || "Único",
        name: item.name
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      // 3. Sucesso! Limpar carrinho e redirecionar
      clearCart();
      router.push(`/checkout/sucesso?id=${order.id}`);

    } catch (error: any) {
      console.error("Erro ao finalizar:", error);
      alert("Erro ao processar pedido: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <CreditCard className="text-accent" /> Pagamento
      </h2>

      {/* Resumo do Endereço (Compacto) */}
      <div className="bg-[#1e1e1e] p-4 rounded-lg border border-white/10 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold">Enviando para:</p>
          <p className="text-sm text-gray-300">{address.street}, {address.number} - {address.city}</p>
        </div>
        <button onClick={onBack} className="text-xs text-accent hover:underline">Alterar</button>
      </div>

      {/* Seleção de Método */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setMethod("pix")}
          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
            method === "pix" ? "bg-accent text-white border-accent" : "bg-[#141414] text-gray-400 border-white/10 hover:border-white/30"
          }`}
        >
          <QrCode size={24} />
          <span className="font-bold">PIX</span>
          {method === "pix" && <CheckCircle size={16} className="text-white" />}
        </button>

        <button
          onClick={() => setMethod("credit_card")}
          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
            method === "credit_card" ? "bg-accent text-white border-accent" : "bg-[#141414] text-gray-400 border-white/10 hover:border-white/30"
          }`}
        >
          <CreditCard size={24} />
          <span className="font-bold">Cartão</span>
          {method === "credit_card" && <CheckCircle size={16} className="text-white" />}
        </button>
      </div>

      {/* Detalhes do Pagamento (Simulação) */}
      <div className="bg-[#141414] p-6 rounded-xl border border-white/10 text-center">
        {method === "pix" ? (
          <div className="space-y-2">
            <p className="text-green-400 font-bold text-lg">5% de Desconto no Pix!</p>
            <p className="text-sm text-gray-400">O código QR Code será gerado na próxima tela.</p>
            <p className="text-sm text-gray-400">Aprovação imediata.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-white font-bold">Cartão de Crédito</p>
            <div className="flex justify-center gap-2 text-gray-500">
               <div className="w-8 h-5 bg-gray-700 rounded"></div>
               <div className="w-8 h-5 bg-gray-700 rounded"></div>
               <div className="w-8 h-5 bg-gray-700 rounded"></div>
            </div>
            <p className="text-sm text-gray-400">Ambiente criptografado e seguro.</p>
          </div>
        )}
      </div>

      {/* Botão Finalizar */}
      <button
        onClick={handleFinishOrder}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Lock size={20} />}
        {loading ? "Processando..." : `Finalizar Pedido • ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`}
      </button>
      
      <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-4">
        <Lock size={10} /> Seus dados estão protegidos.
      </p>
    </div>
  );
}