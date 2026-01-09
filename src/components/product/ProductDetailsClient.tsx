"use client";

import { useCart } from "@/store/useCart";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, ShoppingCart, Truck, ShieldCheck, Ruler, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Interface dos dados que vêm do Supabase
interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string; // Capa
    category: string;
    gallery: string[]; // Array de URLs tratado
    sizes: string[];   // Array de Tamanhos tratado
  }
}

export default function ProductDetailsClient({ product }: ProductProps) {
  const { addToCart } = useCart();
  
  // Estados locais
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [isAdded, setIsAdded] = useState(false);
  const [showError, setShowError] = useState(false);

  // Se a imagem do produto mudar externamente, atualiza a galeria
  useEffect(() => {
    setActiveImage(product.image);
  }, [product]);

  const handleAddToCart = () => {
    // Validação de Tamanho (Se tiver tamanhos disponíveis)
    if (product.sizes.length > 0 && !selectedSize) {
      setShowError(true);
      // Pequena vibração ou alerta
      return;
    }

    // Cria ID único para o carrinho (Ex: 123-M)
    const itemToAdd = {
      ...product,
      id: selectedSize ? `${product.id}-${selectedSize}` : product.id,
      originalId: product.id,
      selectedSize: selectedSize
    };

    addToCart(itemToAdd);
    setShowError(false);
    
    // Feedback visual
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="py-8 animate-fadeIn text-white">
      {/* Breadcrumb / Voltar */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/produtos" className="hover:text-white flex items-center gap-1 transition">
           <ArrowLeft size={16} /> Voltar
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        
        {/* --- ESQUERDA: Galeria de Fotos --- */}
        <div className="space-y-4">
          {/* Imagem Principal */}
          <div className="relative aspect-square bg-panel2 rounded-xl overflow-hidden border border-border group">
            <Image 
              src={activeImage || "https://placehold.co/600"} 
              alt={product.name} 
              fill 
              className="object-cover transition duration-500 group-hover:scale-105"
              priority 
              unoptimized={true}
            />
          </div>

          {/* Miniaturas (Só mostra se tiver mais de 1 imagem ou galeria) */}
          {(product.gallery.length > 0) && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {/* Botão para a Capa Original */}
              <button
                onClick={() => setActiveImage(product.image)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImage === product.image ? "border-accent opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={product.image} alt="Capa" fill className="object-cover" unoptimized={true} />
              </button>

              {/* Loop da Galeria */}
              {product.gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img ? "border-accent opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Foto ${index}`} fill className="object-cover" unoptimized={true} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- DIREITA: Informações --- */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-white italic mb-2 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-end gap-3 mt-4">
                <span className="text-4xl font-bold text-accent">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </span>
                <span className="text-gray-500 mb-1 text-sm">em até 12x</span>
            </div>
          </div>

          <div className="bg-panel p-5 rounded-lg border border-border text-gray-300 text-sm leading-relaxed">
            {product.description || "Sem descrição disponível."}
          </div>

          {/* Seletor de Tamanho */}
          {product.sizes.length > 0 && (
            <div>
                <div className="flex justify-between mb-3">
                <label className={`text-sm font-bold uppercase tracking-wider ${showError ? "text-red-500 animate-pulse" : "text-white"}`}>
                    {showError ? "Selecione um tamanho obrigatório:" : "Escolha o tamanho:"}
                </label>
                <button className="text-xs text-gray-400 underline flex items-center gap-1 hover:text-white">
                    <Ruler size={14} /> Tabela de medidas
                </button>
                </div>
                <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                    <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setShowError(false); }}
                    className={`
                        w-12 h-12 rounded-lg font-bold border-2 transition-all flex items-center justify-center
                        ${selectedSize === size 
                        ? "bg-white text-black border-white scale-110 shadow-lg" 
                        : "bg-panel2 border-border text-gray-400 hover:border-white hover:text-white"
                        }
                        ${showError ? "border-red-500/50" : ""}
                    `}
                    >
                    {size}
                    </button>
                ))}
                </div>
            </div>
          )}

          {/* Botão de Ação */}
          <button
            onClick={handleAddToCart}
            className={`
              w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-wide
              ${isAdded 
                ? "bg-green-600 text-white shadow-green-900/20 scale-105" 
                : "bg-accent hover:bg-red-700 text-white shadow-red-900/20 active:scale-95"
              }
            `}
          >
            {isAdded ? (
              <>
                <Check size={24} /> Produto Adicionado!
              </>
            ) : (
              <>
                <ShoppingCart size={24} /> Adicionar ao Carrinho
              </>
            )}
          </button>

          {/* Benefícios */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="p-2 bg-panel rounded-full"><Truck className="text-white" size={18} /></div>
              <span>Entrega para todo o Brasil</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="p-2 bg-panel rounded-full"><ShieldCheck className="text-white" size={18} /></div>
              <span>Garantia de qualidade 30 dias</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}