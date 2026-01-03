"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/data/products";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function ProdutosPage() {
  const [activeCategory, setActiveCategory] = useState("todos");

  // 1. Extrair categorias únicas dos produtos para criar os botões
  const categories = ["todos", ...Array.from(new Set(products.map(p => p.category)))];

  // 2. Filtrar os produtos com base na seleção
  const filteredProducts = activeCategory === "todos" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="py-8 space-y-8">
      
      {/* --- CABEÇALHO DA PÁGINA --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Coleção Completa</h1>
          <p className="text-muted">Explore nossos equipamentos de alta performance.</p>
        </div>
        
        <div className="text-sm text-muted bg-panel2 px-4 py-2 rounded-full border border-border">
          {filteredProducts.length} produtos encontrados
        </div>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex items-center gap-2 text-muted mr-2">
          <SlidersHorizontal size={18} />
          <span className="text-sm font-bold">Filtros:</span>
        </div>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-5 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap
              ${activeCategory === cat 
                ? "bg-white text-black scale-105 shadow-lg shadow-white/10" 
                : "bg-panel border border-border text-muted hover:text-white hover:border-white"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- GRID DE PRODUTOS --- */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Estado vazio (caso raro)
        <div className="text-center py-20 text-muted">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
      
    </div>
  );
}