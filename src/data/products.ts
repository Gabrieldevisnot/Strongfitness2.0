export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  // Novos campos:
  description: string;
  sizes: string[];
  gallery: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Camiseta Oversized Essential",
    price: 99.90,
    category: "oversized",
    image: "/assets/Over-frente.jpeg",
    description: "Modelagem oversized autêntica, desenvolvida para proporcionar liberdade total de movimento. Tecido premium com toque frio e tecnologia anti-suor.",
    sizes: ["P", "M", "G", "GG", "XG"],
    gallery: ["/assets/Over-frente.jpeg", "/assets/Over-costas.jpeg", "/assets/Over-detalhe.jpeg"]
  },
  {
    id: 2,
    name: "Camiseta Bear Signature",
    price: 119.90,
    category: "oversized",
    image: "/assets/Over-costas.jpeg",
    description: "Estampa exclusiva Bear com silk de alta densidade. A peça statement que faltava no seu guarda-roupa de treino. Durabilidade extrema.",
    sizes: ["P", "M", "G", "GG"],
    gallery: ["/assets/Over-frente.jpeg", "https://placehold.co/600x600/141414/FFF?text=Zoom+Estampa", "https://placehold.co/600x600/141414/FFF?text=Lifestyle"]
  },
  {
    id: 3,
    name: "Shorts Treino Pro",
    price: 89.90,
    category: "shorts",
    image: "https://placehold.co/600x600/141414/FFF?text=Shorts+Pro",
    description: "Shorts com compressão interna e bolsos estratégicos para telemóvel. O melhor aliado para o leg day.",
    sizes: ["38", "40", "42", "44"],
    gallery: ["https://placehold.co/600x600/141414/FFF?text=Shorts+Pro", "https://placehold.co/600x600/141414/FFF?text=Bolso"]
  },
  {
    id: 4,
    name: "Conjunto Aesthetic",
    price: 149.90,
    category: "conjuntos",
    image: "https://placehold.co/600x600/141414/FFF?text=Conjunto+Aesthetic",
    description: "O combo perfeito. Regata cavada + Shorts curto para mostrar o resultado do treino. Tecido leve e respirável.",
    sizes: ["P", "M", "G"],
    gallery: ["https://placehold.co/600x600/141414/FFF?text=Conjunto", "https://placehold.co/600x600/141414/FFF?text=Regata", "https://placehold.co/600x600/141414/FFF?text=Shorts"]
  }
];