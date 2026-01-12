import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean; // <--- Garantindo que existe aqui
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // <--- Estado inicial

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  checkUser: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },
}));

// Inicializa a verificação ao carregar o app (opcional, mas recomendado chamar no layout)
useAuth.getState().checkUser();