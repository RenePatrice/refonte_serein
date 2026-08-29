import { create } from 'zustand';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

const STORAGE_KEY = 'serein_cart_v1';

export const useCartStore = create<CartState>((set, get) => {
  // Charger l'état initial depuis le localStorage côté client
  let initialItems: CartItem[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        initialItems = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erreur chargement panier local:', e);
    }
  }

  const saveItems = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Erreur sauvegarde panier local:', e);
      }
    }
  };

  return {
    items: initialItems,
    isOpen: false,

    addItem: (product: Product, quantity = 1) => {
      set((state) => {
        const existingIndex = state.items.findIndex(
          (item) => item.product.id === product.id
        );
        let updatedItems: CartItem[];

        if (existingIndex > -1) {
          updatedItems = [...state.items];
          const newQty = updatedItems[existingIndex].quantity + quantity;
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: Math.min(newQty, product.stock || 99),
          };
        } else {
          updatedItems = [
            ...state.items,
            {
              product,
              quantity: Math.min(quantity, product.stock || 99),
            },
          ];
        }

        saveItems(updatedItems);
        return { items: updatedItems, isOpen: true };
      });
    },

    removeItem: (productId: string) => {
      set((state) => {
        const updatedItems = state.items.filter(
          (item) => item.product.id !== productId
        );
        saveItems(updatedItems);
        return { items: updatedItems };
      });
    },

    updateQuantity: (productId: string, quantity: number) => {
      set((state) => {
        if (quantity <= 0) {
          const updatedItems = state.items.filter(
            (item) => item.product.id !== productId
          );
          saveItems(updatedItems);
          return { items: updatedItems };
        }

        const updatedItems = state.items.map((item) => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity: Math.min(quantity, item.product.stock || 99),
            };
          }
          return item;
        });

        saveItems(updatedItems);
        return { items: updatedItems };
      });
    },

    clearCart: () => {
      saveItems([]);
      set({ items: [] });
    },

    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

    getTotalCount: () => {
      return get().items.reduce((total, item) => total + item.quantity, 0);
    },

    getTotalPrice: () => {
      return get().items.reduce((total, item) => {
        const unitPrice =
          item.product.prix_promo_fcfa || item.product.prix_fcfa;
        return total + unitPrice * item.quantity;
      }, 0);
    },
  };
});
