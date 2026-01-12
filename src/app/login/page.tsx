"use client";

import { useState } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Pegamos a função login e o estado isLoading da nossa store
  const { login, isLoading } = useAuth();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/"; // Para onde ir depois de logar

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // CORREÇÃO AQUI: Passamos os 2 argumentos separados (email, password)
      await login(email, password);
      
      // Se não der erro, redireciona
      router.push(redirectUrl);
    } catch (err: any) {
      // Se der erro (senha errada, etc), mostramos na tela
      setError("Email ou senha inválidos. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141414] border border-white/10 p-8 rounded-2xl shadow-2xl animate-fadeIn">
        
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-3xl text-white italic tracking-tighter mb-2">
            STRONG<span className="text-[#e50914]">FITNESS</span>
          </h1>
          <p className="text-gray-400">Entre para continuar comprando.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#e50914] outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#e50914] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#e50914] hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <LogIn size={18} />}
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-white hover:text-[#e50914] font-bold transition">
            Cadastre-se
          </Link>
        </div>

      </div>
    </div>
  );
}