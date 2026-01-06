import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string; // Adicionamos a role aqui
}

interface AuthState {
  user: User | null;
  login: (userData: any) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      
      login: (userData) => {
        set({ 
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          } 
        });
      },

      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
    }
  )
);