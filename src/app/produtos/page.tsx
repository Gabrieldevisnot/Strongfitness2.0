"use client";

import { useState, useEffect } from "react";
// CORREÇÃO AQUI: Removemos as chaves { }
import ProductCard from "@/components/ui/ProductCard"; 
import { supabase } from "@/lib/supabase";
import { Filter, SlidersHorizontal, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-accent w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-white italic">COLEÇÃO</h1>
          <p className="text-gray-400">Equipamentos para alta performance.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-panel border border-border px-4 py-2 rounded-lg text-sm font-bold text-white hover:border-accent transition">
          <SlidersHorizontal size={16} /> FILTRAR
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-20">Nenhum produto encontrado.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}