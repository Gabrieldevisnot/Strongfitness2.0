import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ui/ProductCard";

// --- CONFIGURAÇÃO ANTI-CACHE ---
// Garante que a página reconstrua a cada acesso, evitando mostrar produtos deletados
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  
  // 1. TENTATIVA PRINCIPAL: Buscar até 4 produtos da categoria "Lançamento"
  let { data: launches } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lançamento') // Filtra exatamente o que está no Admin
    .order('created_at', { ascending: false })
    .limit(4);

  // Garante que é um array (mesmo se vier null)
  let displayProducts = launches || [];

  // 2. LÓGICA DE PREENCHIMENTO (FALLBACK)
  // Se encontrou menos de 4 lançamentos, busca outros para completar
  if (displayProducts.length < 4) {
    const slotsNeeded = 4 - displayProducts.length;
    
    // Cria uma lista dos IDs que já temos para não duplicar
    const existingIds = displayProducts.map((p: any) => p.id);
    
    // Busca produtos normais EXCLUINDO os que já pegamos
    const { data: fillers } = await supabase
      .from('products')
      .select('*')
      // Se existingIds estiver vazio, usamos '0' para não quebrar a query SQL
      .not('id', 'in', `(${existingIds.length > 0 ? existingIds.join(',') : '0'})`)
      .order('created_at', { ascending: false })
      .limit(slotsNeeded);

    if (fillers) {
      displayProducts = [...displayProducts, ...fillers];
    }
  }

  return (
    <div className="pb-20">
      {/* Banner Hero */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470" 
          alt="Banner StrongFitness" 
          fill 
          className="object-cover opacity-40" 
          priority
          unoptimized={true}
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-display font-black text-5xl md:text-6xl text-white italic mb-4">
            DOMINE O <span className="text-accent">JOGO</span>
          </h1>
          <Link href="/produtos" className="inline-flex items-center gap-2 bg-accent hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold uppercase transition hover:scale-105 transform duration-200">
            Ver Coleção <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Grid de Destaques */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8 border-b border-border pb-4">
          <div>
            <span className="text-accent text-sm font-bold uppercase tracking-wider">Novidades</span>
            <h2 className="text-3xl font-display font-bold text-white italic">
              DESTAQUES DA LOJA
            </h2>
          </div>
          <Link href="/produtos" className="hidden md:flex items-center gap-1 text-gray-400 hover:text-white text-sm">
            Ver tudo <ArrowRight size={16} />
          </Link>
        </div>
        
        {!displayProducts || displayProducts.length === 0 ? (
           <div className="text-center py-20 bg-panel rounded-xl border border-border">
             <p className="text-gray-500 mb-4">Nenhum produto cadastrado ainda.</p>
             <Link href="/admin" className="text-accent font-bold hover:underline">Ir para Admin cadastrar</Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {/* Botão Mobile "Ver tudo" */}
        <div className="mt-8 text-center md:hidden">
           <Link href="/produtos" className="inline-block border border-border text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-white hover:text-black transition">
             Ver todos os produtos
           </Link>
        </div>
      </section>
    </div>
  );
}