import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/data/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product) => void;
  decreaseQty: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  // Estas funções calculadas são essenciais:
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Adicionar Item (ou aumentar quantidade)
      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedItems = currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      // Diminuir Quantidade
      decreaseQty: (productId) => {
        const currentItems = get().items;
        const updatedItems = currentItems.map((item) => {
          if (item.id === productId && item.quantity > 1) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      // Remover Item Completamente
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      // Limpar Carrinho
      clearCart: () => set({ items: [] }),

      // --- GETTERS (Cálculos) ---
      
      // Calcula o total em dinheiro
      totalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      // Calcula o total de itens
      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'strongfitness-cart',
    }
  )
);