"use client";

import { useCart } from "@/store/useCart";
import { ShoppingCart } from "lucide-react";

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <button 
      onClick={() => addToCart(product)}
      className="flex-1 bg-accent hover:bg-red-700 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition uppercase tracking-wide"
    >
      <ShoppingCart size={20} /> Adicionar ao Carrinho
    </button>
  );
}