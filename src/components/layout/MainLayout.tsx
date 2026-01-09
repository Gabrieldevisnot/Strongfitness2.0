"use client";

import { useState } from "react";
import Header from "./Header"; 
import { Sidebar } from "./Sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  // Estado para controlar sidebar mobile, se houver
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-gray-100">
      {/* O Header fica fixo no topo */}
      <Header />

      <div className="flex flex-1 pt-0">
        {/* Se a Sidebar for usada, ela entra aqui. 
            Se não estiver sendo usada visualmente, pode remover ou comentar. */}
        {/* <Sidebar isOpen={isSidebarOpen} /> */}

        <main className="flex-1 w-full max-w-[1920px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}