import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number;
  originalId?: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  category?: string; // <--- ADICIONADO AQUI (Opcional)
}

interface CartStore {
  items: CartItem[];
  total: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      total: 0,

      addToCart: (newItem) => {
        const currentItems = get().items;
        // Verifica se já existe item igual (mesmo ID e Tamanho)
        const existingItemIndex = currentItems.findIndex(
          (i) => i.id === newItem.id && i.selectedSize === newItem.selectedSize
        );

        let updatedItems;

        if (existingItemIndex > -1) {
          // Se existe, atualiza a quantidade
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          // Se não, adiciona novo
          updatedItems = [...currentItems, newItem];
        }

        // Recalcula total
        const newTotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ items: updatedItems, total: newTotal });
      },

      decreaseQty: (itemId) => {
        const currentItems = get().items;
        
        const updatedItems = currentItems.map((item) => {
          if (item.id === itemId) {
            // Se for maior que 1, diminui. Se for 1, mantém.
            return { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }; 
          }
          return item;
        });

        const newTotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ items: updatedItems, total: newTotal });
      },

      removeFromCart: (itemId) => {
        const currentItems = get().items;
        const updatedItems = currentItems.filter((i) => i.id !== itemId);
        
        const newTotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ items: updatedItems, total: newTotal });
      },

      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);