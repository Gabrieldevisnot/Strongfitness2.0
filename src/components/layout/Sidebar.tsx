import Link from "next/link";
import { X, Home, ShoppingBag, User, Package } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay Escuro (Fundo) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div 
        className={`fixed inset-y-0 left-0 w-[280px] bg-panel border-r border-border z-[70] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-border">
          <span className="font-display font-bold text-lg text-white">Menu</span>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-2">
          <NavItem href="/" icon={<Home size={20}/>} label="Início" onClick={onClose} />
          <NavItem href="/produtos" icon={<ShoppingBag size={20}/>} label="Produtos" onClick={onClose} />
          <NavItem href="/perfil" icon={<User size={20}/>} label="Minha Conta" onClick={onClose} />
          <NavItem href="/pedidos" icon={<Package size={20}/>} label="Meus Pedidos" onClick={onClose} />
        </nav>
      </div>
    </>
  );
}

// Pequeno componente auxiliar interno para não repetir código
function NavItem({ href, icon, label, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted hover:text-white hover:bg-panel2 transition font-medium"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}