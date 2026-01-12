import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAdmin: boolean; // <--- Novo estado
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAdmin: false, // Começa falso
  isLoading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      throw error;
    }

    // Se logou, verifica se é admin imediatamente
    const isAdmin = await checkIsAdmin(data.user.id);
    
    set({ user: data.user, isAdmin, isLoading: false });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
  },

  checkUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Se tem usuário, verifica se ele está na tabela de admins
        const isAdmin = await checkIsAdmin(user.id);
        set({ user, isAdmin, isLoading: false });
      } else {
        set({ user: null, isAdmin: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAdmin: false, isLoading: false });
    }
  },
}));

// Função auxiliar (fora do hook) para ir no banco checar
async function checkIsAdmin(userId: string) {
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .single();
  
  return !!data; // Retorna true se achou, false se não achou
}

// Inicializa
useAuth.getState().checkUser();