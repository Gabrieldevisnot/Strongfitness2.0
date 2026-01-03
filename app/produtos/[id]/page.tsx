
"use client";

import { useParams } from "next/navigation";
import { products } from "@/data/products";
import { useCart } from "@/store/useCart";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, ShoppingCart, Truck, ShieldCheck, Ruler } from "lucide-react";
import Link from "next/link";

export default function ProdutoDetalhePage() {
  const params = useParams();
  const { addToCart } = useCart();
  
  // 1. Encontrar o produto pelo ID da URL
  // O params.id vem como string, convertemos para number
  const productId = Number(params.id);
  const product = products.find((p) => p.id === productId);

  // Estados locais
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);

  // Define a imagem principal inicial assim que o produto carrega
  useEffect(() => {
    if (product) setActiveImage(product.image);
  }, [product]);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Produto não encontrado</h1>
        <Link href="/produtos" className="text-accent hover:underline mt-4 block">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

    // Adiciona ao carrinho (Nota: Para diferenciar tamanhos no carrinho, 
    // idealmente o ID do item no carrinho deveria ser composto ex: 1-M, mas vamos manter simples por agora)
    addToCart(product);
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="py-8 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="text-sm text-muted mb-6 flex gap-2">
        <Link href="/" className="hover:text-white">Home</Link> / 
        <Link href="/produtos" className="hover:text-white">Produtos</Link> / 
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        
        {/* --- ESQUERDA: Galeria de Fotos --- */}
        <div className="space-y-4">
          {/* Imagem Principal */}
          <div className="relative aspect-square bg-panel2 rounded-xl overflow-hidden border border-border">
            {activeImage && (
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority // Carrega rápido por ser a principal
              />
            )}
          </div>

          {/* Miniaturas */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.gallery.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  activeImage === img ? "border-accent opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* --- DIREITA: Informações --- */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {product.name}
            </h1>
            <div className="text-2xl font-bold text-accent">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </div>
            <p className="text-muted text-sm mt-1">em até 3x sem juros</p>
          </div>

          <div className="bg-panel p-4 rounded-lg border border-border text-muted text-sm leading-relaxed">
            {product.description}
          </div>

          {/* Seletor de Tamanho */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-white">Escolha o tamanho:</label>
              <button className="text-xs text-muted underline flex items-center gap-1">
                <Ruler size={12} /> Tabela de medidas
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    w-12 h-12 rounded-lg font-bold border-2 transition-all flex items-center justify-center
                    ${selectedSize === size 
                      ? "bg-white text-black border-white scale-110" 
                      : "bg-panel2 border-border text-muted hover:border-white hover:text-white"
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Ação */}
          <button
            onClick={handleAddToCart}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
              ${isAdded 
                ? "bg-success text-white shadow-green-900/20" 
                : "bg-accent hover:bg-accentHover text-white shadow-red-900/20 active:scale-95"
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
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted">
              <Truck className="text-white" size={20} />
              <span>Entrega para todo o Brasil</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <ShieldCheck className="text-white" size={20} />
              <span>Garantia de qualidade 30 dias</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}