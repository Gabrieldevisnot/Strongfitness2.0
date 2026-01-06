"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/useAuth";
import Link from "next/link";
import { Loader2, Lock, Mail, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Buscar dados do perfil (role e nome)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        // Salvar no estado global
        login({
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.name || "Cliente",
          role: profile?.role || "user"
        });

        router.push("/");
      } else {
        // --- CADASTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }, // Envia nome para metadados
        });
        if (error) throw error;
        alert("Conta criada! Faça login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="max-w-md w-full space-y-8 bg-black/50 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-black italic text-white">
            {isLogin ? "BEM-VINDO" : "CRIAR CONTA"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? "Entre para gerenciar seus pedidos" : "Junte-se ao time StrongFitness"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" placeholder="Nome Completo" required value={name} onChange={e => setName(e.target.value)}
                  className="pl-10 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
                className="pl-10 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" placeholder="Senha" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                className="pl-10 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none" />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-900/10 p-2 rounded">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-wider">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "ENTRAR" : "CRIAR CONTA")}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm text-gray-400 hover:text-white underline mt-4">
          {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça Login"}
        </button>
      </div>
    </div>
  );
}