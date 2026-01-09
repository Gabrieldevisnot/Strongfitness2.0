"use client";

import { useState } from "react";
import { useCart } from "@/store/useCart";
import { ShoppingCart, AlertCircle } from "lucide-react";

interface ProductSelectorProps {
  product: any;
}

export default function ProductSelector({ product }: ProductSelectorProps) {
  const { addToCart } = useCart();
  
  // Estados para armazenar as escolhas
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // SIMULAÇÃO: Definindo opções baseadas na categoria (Isso viria do banco idealmente)
  // Se for "Roupas", tem tamanhos. Se for "Equipamentos", talvez não tenha.
  const hasSizes = product.category?.toLowerCase().includes("roupas") || product.category?.toLowerCase().includes("camisetas");
  
  // Opções disponíveis (Hardcoded por enquanto)
  const sizes = ["P", "M", "G", "GG"];

  const handleAddToCart = () => {
    // 1. REGRA DE VALIDAÇÃO
    if (hasSizes && !selectedSize) {
      setShowError(true);
      // Tremida ou alerta visual
      alert("Por favor, selecione um tamanho antes de continuar.");
      return;
    }

    // 2. Montar objeto com a variação para o carrinho
    const productToAdd = {
      ...product,
      id: `${product.id}-${selectedSize || 'unico'}`, // Cria ID único para variações diferentes
      originalId: product.id,
      selectedSize: selectedSize // Salva o tamanho escolhido
    };

    addToCart(productToAdd);
    setShowError(false);
    
    // Feedback opcional
    // alert("Produto adicionado!"); 
  };

  return (
    <div className="space-y-6">
      
      {/* SELETOR DE TAMANHOS (Só aparece se o produto tiver tamanhos) */}
      {hasSizes && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-bold uppercase tracking-wider ${showError && !selectedSize ? "text-red-500" : "text-gray-400"}`}>
              Escolha o Tamanho:
            </span>
            {showError && !selectedSize && (
              <span className="text-red-500 text-xs flex items-center gap-1 animate-pulse">
                <AlertCircle size={12} /> Obrigatório
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setShowError(false);
                }}
                className={`
                  w-12 h-12 rounded-lg font-bold text-sm transition-all border-2
                  ${selectedSize === size 
                    ? "bg-white text-black border-white" // Selecionado
                    : "bg-transparent text-gray-400 border-white/20 hover:border-white/60" // Não selecionado
                  }
                  ${showError && !selectedSize ? "border-red-500 text-red-500 bg-red-500/10" : ""} // Erro
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTÃO DE AÇÃO */}
      <button 
        onClick={handleAddToCart}
        className={`
          w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all shadow-lg
          ${hasSizes && !selectedSize 
            ? "bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700" // Estado desabilitado visualmente
            : "bg-accent hover:bg-red-700 text-white shadow-red-900/20" // Estado ativo
          }
        `}
      >
        <ShoppingCart size={20} />
        {hasSizes && !selectedSize ? "Selecione uma opção" : "Adicionar ao Carrinho"}
      </button>
    </div>
  );
}