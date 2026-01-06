"use client";

import Image from "next/image";
import Link from "next/link"; // <--- Importar Link
import { Product } from "@/data/products";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCart((state) => state.addToCart);
  const [isAdded, setIsAdded] = useState(false);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede que o clique no botão abra o link do produto
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="group bg-panel border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300 flex flex-col h-full">
      
      {/* Envolvemos a imagem num Link para a página de detalhe */}
      <Link href={`/produtos/${product.id}`} className="relative aspect-square overflow-hidden bg-panel2 block cursor-pointer">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <span className="text-[10px] text-white uppercase font-bold tracking-widest">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex-1">
          {/* Link também no Título */}
          <Link href={`/produtos/${product.id}`} className="hover:text-accent transition-colors">
            <h3 className="font-bold text-lg text-white leading-tight mb-1">
              {product.name}
            </h3>
          </Link>
          <div className="font-display font-extrabold text-xl text-white/90">
            {formatMoney(product.price)}
          </div>
        </div>

        <button 
          onClick={handleAdd}
          disabled={isAdded}
          className={`
            w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95
            ${isAdded 
              ? "bg-success text-white border border-success cursor-default" 
              : "bg-panel2 border border-border text-white hover:bg-white hover:text-black hover:border-white"
            }
          `}
        >
          {isAdded ? (
            <>
              <Check size={20} />
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>Adicionar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}