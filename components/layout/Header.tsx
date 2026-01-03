"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  // 1. Aceder aos itens do carrinho global
  const items = useCart((state) => state.items);
  
  // 2. Estado para controlar a hidratação (evita erros entre Servidor e Cliente)
  const [mounted, setMounted] = useState(false);

  // 3. Quando o componente monta no navegador, definimos como true
  useEffect(() => {
    setMounted(true);
  }, []);

  // 4. Calcular o total de itens (soma das quantidades)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        
        {/* --- ESQUERDA: Menu (Mobile) e Logo --- */}
        <div className="flex items-center gap-4">
          {/* Botão Hambúrguer (Só aparece no Mobile 'md:hidden') */}
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-panel rounded-lg transition text-white md:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          
          <Link href="/" className="font-display font-extrabold text-xl tracking-wide text-white hover:opacity-90 transition">
            STRONGFITNESS
          </Link>
        </div>

        {/* --- CENTRO: Barra de Busca (Só Desktop 'hidden md:flex') --- */}
        <div className="hidden md:flex justify-center w-full max-w-md mx-auto relative group">
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            className="w-full bg-panel border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted group-hover:text-white transition">
            <Search size={18} />
          </button>
        </div>

        {/* --- DIREITA: Ações (Login, Carrinho, Perfil) --- */}
        <div className="flex items-center gap-2 sm:gap-4 justify-end">
          
          {/* Link Entrar (Desktop) */}
          <Link 
            href="/auth" 
            className="hidden md:block text-sm font-semibold hover:text-white transition text-muted"
          >
            Entrar
          </Link>

          {/* Botão Carrinho com Badge */}
          <Link 
            href="/carrinho" 
            className="relative p-2 hover:bg-panel rounded-lg transition text-white group"
            aria-label="Ver carrinho"
          >
            <ShoppingCart size={22} />
            
            {/* Só mostramos o Badge se estiver montado e tiver itens */}
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-sm shadow-red-900">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Botão Perfil */}
          <Link 
            href="/perfil" 
            className="p-2 hover:bg-panel rounded-lg transition text-white"
            aria-label="Minha conta"
          >
            <User size={22} />
          </Link>
        </div>

      </div>
    </header>
  );
}