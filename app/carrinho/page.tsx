"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CarrinhoPage() {
  // 1. Conexão com o Zustand (Store Global)
  const { items, addToCart, decreaseQty, removeFromCart } = useCart();
  
  // 2. Estado para evitar erro de hidratação (Next.js server vs client)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Se ainda não montou no cliente, não mostra nada para evitar "piscar"
  if (!mounted) return null;

  // 3. Cálculos Financeiros
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const frete = subtotal > 0 ? 19.90 : 0; // Frete fixo simples
  const total = subtotal + frete;

  // Função auxiliar para formatar dinheiro
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-display font-bold mb-8 text-white">Meu Carrinho</h1>

      {items.length === 0 ? (
        // --- ESTADO VAZIO ---
        <div className="text-center py-20 bg-panel border border-border rounded-xl">
          <h2 className="text-xl font-bold mb-2 text-white">Seu carrinho está vazio</h2>
          <p className="text-muted mb-6">Parece que você ainda não escolheu seus equipamentos.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-accent hover:bg-accentHover text-white px-6 py-3 rounded-lg font-bold transition"
          >
            Voltar para a Loja <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        // --- GRID DO CARRINHO (Lista + Resumo) ---
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          
          {/* COLUNA ESQUERDA: Lista de Itens */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-panel border border-border rounded-xl items-center">
                
                {/* Imagem do Produto */}
                <div className="relative w-20 h-20 bg-panel2 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate pr-2">{item.name}</h3>
                  <p className="text-sm text-muted mb-1 uppercase text-[10px] tracking-widest font-bold">
                    {item.category}
                  </p>
                  <div className="font-bold text-accent">{formatMoney(item.price)}</div>
                </div>

                {/* Controles de Quantidade */}
                <div className="flex items-center gap-3 bg-panel2 border border-border rounded-lg p-1">
                  <button 
                    onClick={() => decreaseQty(item.id)}
                    className="p-1 hover:bg-white hover:text-black rounded transition disabled:opacity-30 disabled:cursor-not-allowed text-white"
                    disabled={item.quantity <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="text-sm font-bold w-6 text-center text-white">
                    {item.quantity}
                  </span>
                  
                  <button 
                    onClick={() => addToCart(item)}
                    className="p-1 hover:bg-white hover:text-black rounded transition text-white"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Botão Remover */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg transition ml-2"
                  title="Remover item"
                  aria-label="Remover item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* COLUNA DIREITA: Resumo Financeiro */}
          <div className="h-fit space-y-6">
            <div className="bg-panel border border-border rounded-xl p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold mb-4 font-display text-white">Resumo</h2>
              
              <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-white">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Frete estimado</span>
                  <span className="text-white">{formatMoney(frete)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span className="text-white">Total</span>
                <span className="text-accent">{formatMoney(total)}</span>
              </div>

              {/* BOTÃO DE AÇÃO PRINCIPAL */}
              <Link 
                href="/checkout"
                className="block w-full text-center bg-success hover:brightness-110 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-900/20"
              >
                FINALIZAR COMPRA
              </Link>
              
              <Link 
                href="/" 
                className="block text-center text-sm text-muted hover:text-white mt-4 underline decoration-muted hover:decoration-white underline-offset-4 transition"
              >
                Continuar Comprando
              </Link>
            </div>

            {/* Campo de Cupom (Visual) */}
            <div className="bg-panel border border-border rounded-xl p-6">
              <label className="text-sm text-muted mb-2 block">Cupom de desconto</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="STRONG10" 
                  className="flex-1 bg-panel2 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                />
                <button className="px-4 py-2 bg-panel2 border border-border text-white hover:bg-white hover:text-black font-semibold rounded-lg text-sm transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}