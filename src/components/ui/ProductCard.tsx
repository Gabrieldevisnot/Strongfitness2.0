"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react"; // Ícone novo (Olho)

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Nota: Removemos o useCart daqui, pois a compra agora é só na página interna

  // Tratamento de imagem (igual ao anterior)
  const hasValidImage = product.image && product.image.trim() !== "";
  const imageSrc = hasValidImage 
    ? product.image! 
    : "https://placehold.co/600x600/1e1e1e/FFF?text=Sem+Imagem"; 

  return (
    <div className="group relative bg-panel border border-border rounded-xl overflow-hidden hover:border-accent transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-red-900/10">
      
      {/* 1. Imagem (Link) */}
      <Link href={`/produtos/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-panel2 cursor-pointer">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={true}
        />
        
        {/* Overlay ao passar o mouse (Efeito visual premium) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* 2. Informações */}
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/produtos/${product.id}`} className="hover:text-accent transition-colors block">
          <p className="text-xs text-accent font-bold uppercase tracking-wider mb-1">
            {product.category || "Equipamento"}
          </p>
          <h3 className="font-bold text-lg text-white mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Preço e Botão */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50 gap-2">
          <span className="text-lg font-display font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
          
          {/* BOTÃO DETALHES */}
          <Link 
            href={`/produtos/${product.id}`}
            className="bg-white/10 hover:bg-accent text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-all uppercase hover:shadow-lg"
          >
            <Eye size={16} /> Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}