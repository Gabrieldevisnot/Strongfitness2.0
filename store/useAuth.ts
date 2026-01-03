import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  address?: {
    street: string;
    number: string;
    zip: string;
    city: string;
  };
}

interface AuthStore {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateAddress: (address: User['address']) => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, // Começa deslogado

      login: (email) => set({
        user: { 
          name: email.split('@')[0], 
          email,
          // Morada fictícia inicial para facilitar testes
          address: { street: 'Rua Fitness', number: '100', zip: '77000-000', city: 'Palmas' } 
        } 
      }),

      logout: () => set({ user: null }),

      updateAddress: (address) => set((state) => ({
        user: state.user ? { ...state.user, address } : null
      })),
    }),
    { name: 'strongfitness-auth' }
  )
);