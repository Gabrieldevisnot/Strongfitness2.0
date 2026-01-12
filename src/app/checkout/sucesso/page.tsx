"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Home, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-[#141414] border border-white/10 p-8 rounded-2xl shadow-2xl animate-fadeIn">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-black text-white italic mb-2">
          PEDIDO <span className="text-green-500">CONFIRMADO!</span>
        </h1>
        
        <p className="text-gray-400 mb-6">
          Obrigado pela sua compra. Seus equipamentos logo estarão a caminho do treino.
        </p>

        <div className="bg-[#1e1e1e] rounded-xl p-4 mb-8 border border-white/5">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Número do Pedido</p>
          <p className="text-xl font-mono text-white tracking-widest">#{orderId}</p>
        </div>

        <div className="space-y-3">
          <Link 
            href="/minha-conta" 
            className="block w-full bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Package size={20} /> Acompanhar Meus Pedidos
          </Link>
          
          <Link 
            href="/" 
            className="block w-full bg-transparent border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Home size={20} /> Voltar para a Loja
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    // Suspense é necessário porque usamos useSearchParams
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}