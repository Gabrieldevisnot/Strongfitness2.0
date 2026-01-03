"use client"; // <--- Isso avisa o Next.js que este arquivo tem interatividade

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Onde vai entrar o conteúdo de cada página */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border py-8 text-center text-muted text-sm">
        &copy; 2026 STRONGFITNESS
      </footer>
    </div>
  );
}