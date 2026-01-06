"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu, LayoutDashboard, LogOut } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth"; // Importamos o Auth
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const items = useCart((state) => state.items);
  const { user, logout } = useAuth(); // Pegamos usuario e logout
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    // Mantendo seu CSS original que funcionava
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
        
        {/* ESQUERDA: Menu e Logo */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-panel rounded-lg transition text-white md:hidden">
            <Menu size={24} />
          </button>
          <Link href="/" className="font-display font-extrabold text-xl tracking-wide text-white hover:opacity-90 transition">
            STRONGFITNESS
          </Link>
        </div>

        {/* CENTRO: Busca */}
        <div className="hidden md:flex justify-center w-full max-w-md mx-auto relative group">
          <input type="text" placeholder="Buscar produtos..." 
            className="w-full bg-panel border border-border rounded-lg py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted group-hover:text-white transition">
            <Search size={18} />
          </button>
        </div>

        {/* DIREITA: Ações */}
        <div className="flex items-center gap-2 sm:gap-4 justify-end">
          
          {/* LÓGICA DE LOGIN / ADMIN / LOGOUT (Com cuidado para não quebrar o grid) */}
          {mounted && user ? (
            <div className="flex items-center gap-3">
              {/* Se for Admin, mostra ícone do Painel */}
              {user.role === 'admin' && (
                <Link href="/admin" className="text-accent hover:text-white transition" title="Painel Admin">
                   <LayoutDashboard size={20} />
                </Link>
              )}
              
              <div className="hidden md:block text-right leading-tight">
                 <span className="block text-[10px] text-gray-500 uppercase">Olá</span>
                 <span className="block text-sm font-bold text-white">{user.name?.split(' ')[0]}</span>
              </div>

              <button onClick={logout} className="text-gray-500 hover:text-red-500 transition" title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
             <Link href="/login" className="hidden md:block text-sm font-semibold hover:text-white transition text-muted">
               Entrar
             </Link>
          )}

          {/* Carrinho (Intacto) */}
          <Link href="/carrinho" className="relative p-2 hover:bg-panel rounded-lg transition text-white group">
            <ShoppingCart size={22} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}