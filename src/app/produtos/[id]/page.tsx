// ... imports (MANTENHA OS MESMOS)
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

interface ProductDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsProps) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(url)")
    .eq("id", id)
    .single();

  if (!product) {
    // ... (MANTENHA O CÓDIGO DE ERRO IGUAL)
    return <div>Produto não encontrado...</div>
  }

  const gallery = product.product_images?.map((img: any) => img.url) || [];

  // --- MUDANÇA AQUI: ---
  // Antes: const sizes = isClothing ? ["P", "M", "G"] ...
  // Agora: Usamos diretamente o que vem do banco. Se vier null, array vazio.
  const sizes = product.sizes || []; 
  // ---------------------

  const formattedProduct = {
    ...product,
    gallery: gallery,
    sizes: sizes // Passa a lista real para o componente
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4">
      <ProductDetailsClient product={formattedProduct} />
    </div>
  );
}