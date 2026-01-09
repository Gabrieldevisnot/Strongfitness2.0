"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/useCart";

// Interface para garantir a tipagem correta
interface Product {
  id: number;
  name: string;
  price: number;
  image?: string; // Pode ser opcional/undefined
  category?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // --- CORREÇÃO DO ERRO ---
  // Verifica se existe imagem E se ela não é uma string vazia ("")
  // Se for vazia, usa uma imagem genérica de "Sem Imagem"
  const hasValidImage = product.image && product.image.trim() !== "";
  const imageSrc = hasValidImage 
    ? product.image! 
    : "https://placehold.co/600x600/1e1e1e/FFF?text=Sem+Imagem"; 
  // ------------------------

  return (
    <div className="group relative bg-panel border border-border rounded-xl overflow-hidden hover:border-accent transition-all duration-300 flex flex-col h-full">
      
      {/* 1. Link para a Página de Detalhes */}
      <Link href={`/produtos/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-panel2 cursor-pointer">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={true} // Evita cache teimoso
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {/* Título também clicável */}
        <Link href={`/produtos/${product.id}`} className="hover:text-accent transition-colors">
          <h3 className="font-bold text-lg text-white mb-1">{product.name}</h3>
        </Link>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {product.description || "Alta performance."}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <span className="text-xl font-display font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          
          {/* Botão de Adicionar ao Carrinho (Não navega, só adiciona) */}
          <button 
            onClick={(e) => {
              e.preventDefault(); // Impede que o clique no botão abra a página de detalhes
              addToCart(product as any);
            }}
            className="bg-white text-black p-2 rounded-full hover:bg-accent hover:text-white transition-colors z-20 relative"
            title="Adicionar ao Carrinho"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}