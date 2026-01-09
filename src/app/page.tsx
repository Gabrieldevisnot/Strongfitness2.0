import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/data/products";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";


// --- FORÇAR ATUALIZAÇÃO ---
// Estas duas linhas garantem que a Home nunca guarde cache velho
export const revalidate = 0;
export const dynamic = "force-dynamic";
// --------------------------

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      
      {/* Hero Section (Banner Principal) */}
      <section className="text-center py-16 md:py-24 border-b border-border">
        <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          VISTA O SEU MELHOR <br /> DESEMPENHO.
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto mb-8">
          Roupas oversized e dry fit desenvolvidas para quem leva o treino a sério.
          Estilo, conforto e durabilidade premium.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/produtos" className="bg-accent hover:bg-accentHover text-white px-8 py-3 rounded-full font-bold transition flex items-center gap-2">
            Ver Coleção <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Grid de Produtos */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold font-display text-white">Destaques da Semana</h2>
          <Link href="/produtos" className="text-accent hover:text-white transition text-sm font-semibold">
            Ver tudo &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}