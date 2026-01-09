"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth"; 
import { Search, ShoppingCart, User, LogOut, Package, MapPin, LayoutDashboard } from "lucide-react"; // Adicionado LayoutDashboard

export default function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de busca
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        {/* 1. LOGO */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="font-display font-black text-2xl tracking-tighter text-white italic">
            STRONG<span className="text-[#E50914]">FITNESS</span>
          </h1>
        </Link>

        {/* 2. BARRA DE PESQUISA */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative w-full group">
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              className="w-full bg-[#121212] border border-white/10 rounded-2xl py-3 pl-5 pr-14 text-sm text-gray-200 outline-none focus:border-[#E50914]/50 transition-all placeholder:text-gray-500 h-[50px]"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-2 bottom-2 bg-[#E50914] hover:bg-red-700 text-white w-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>

        {/* 3. AÇÕES DIREITA */}
        <div className="flex items-center gap-4">
          
          {/* Botões Login/Criar Conta (Só vê se não logado) */}
          {!user && (
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/login" 
                className="text-gray-200 text-sm font-bold px-4 py-2 hover:text-white transition"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-[#1e1e1e] border border-white/10 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-white/10 transition"
              >
                Criar Conta
              </Link>
            </div>
          )}

          {/* Carrinho */}
          <Link href="/carrinho" className="relative p-2 text-gray-400 hover:text-white transition group">
            <div className="w-10 h-10 rounded-lg bg-[#1e1e1e] border border-white/10 flex items-center justify-center hover:border-white/30 transition">
               <ShoppingCart size={20} />
            </div>
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E50914] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                {items.length}
              </span>
            )}
          </Link>

          {/* Menu do Usuário */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1e1e1e] border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition focus:outline-none"
            >
              <User size={20} />
            </button>

            {/* DROPDOWN */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#121212] border border-white/10 rounded-xl shadow-2xl py-2 animate-fadeIn z-50">
                <div className="px-4 py-3 border-b border-white/10 mb-2">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                    {user ? "Minha Conta" : "Convidado"}
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {user ? (user.email || "Cliente") : "Bem-vindo!"}
                  </p>
                </div>
                
                <nav className="flex flex-col">
                  {user ? (
                    <>
                      {/* --- ITEM DE ADMIN (Só aparece se user.role for 'admin') --- */}
                      {user.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E50914] font-bold hover:bg-white/5 transition border-b border-white/5 mb-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Painel Admin
                        </Link>
                      )}

                      <Link href="/perfil" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>
                        <User size={16} /> Meu Perfil
                      </Link>
                      <Link href="/minha-conta" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>
                        <Package size={16} /> Meus Pedidos
                      </Link>
                      <Link href="/minha-conta" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition" onClick={() => setIsMenuOpen(false)}>
                        <MapPin size={16} /> Endereços
                      </Link>
                      
                      <button onClick={() => { logout(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#E50914] bg-[#1e1e1e] mt-2 border-t border-white/10 transition w-full text-left font-bold">
                        <LogOut size={16} /> Sair
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-[#E50914] bg-[#1e1e1e] mt-2 border-t border-white/10 transition w-full text-left font-bold" onClick={() => setIsMenuOpen(false)}>
                       Entrar / Criar Conta
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}