import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  formatCheckoutUrl,
  hasCartExpired,
  storefrontApiRequest,
  type Money,
  type ShopifyProduct,
} from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: Money;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

type CartPayload = {
  cart?: { id: string; checkoutUrl?: string; totalQuantity?: number; lines?: { edges: Array<{ node: { id: string; merchandise: { id: string } } }> } } | null;
  userErrors?: Array<{ message: string }>;
};

interface CartState {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      addItem: async (item) => {
        set({ isLoading: true });
        try {
          const state = get();
          const existing = state.items.find((entry) => entry.variantId === item.variantId);
          if (!state.cartId) {
            const data = await storefrontApiRequest<{ cartCreate: CartPayload }>(CART_CREATE_MUTATION, {
              input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
            });
            const payload = data?.cartCreate;
            const cart = payload?.cart;
            const lineId = cart?.lines?.edges[0]?.node.id;
            if (!cart?.id || !cart.checkoutUrl || !lineId || payload?.userErrors?.length) return;
            set({ cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), items: [{ ...item, lineId }] });
          } else if (existing?.lineId) {
            const quantity = existing.quantity + item.quantity;
            const data = await storefrontApiRequest<{ cartLinesUpdate: CartPayload }>(CART_LINES_UPDATE_MUTATION, {
              cartId: state.cartId,
              lines: [{ id: existing.lineId, quantity }],
            });
            const errors = data?.cartLinesUpdate.userErrors ?? [];
            if (hasCartExpired(errors)) return get().clearCart();
            if (!errors.length) set({ items: get().items.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity } : entry) });
          } else {
            const data = await storefrontApiRequest<{ cartLinesAdd: CartPayload }>(CART_LINES_ADD_MUTATION, {
              cartId: state.cartId,
              lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
            });
            const payload = data?.cartLinesAdd;
            const errors = payload?.userErrors ?? [];
            if (hasCartExpired(errors)) return get().clearCart();
            const line = payload?.cart?.lines?.edges.find((entry) => entry.node.merchandise.id === item.variantId);
            if (!errors.length && line) set({ items: [...get().items, { ...item, lineId: line.node.id }] });
          }
        } finally {
          set({ isLoading: false });
        }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const state = get();
        const item = state.items.find((entry) => entry.variantId === variantId);
        if (!state.cartId || !item?.lineId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<{ cartLinesUpdate: CartPayload }>(CART_LINES_UPDATE_MUTATION, {
            cartId: state.cartId,
            lines: [{ id: item.lineId, quantity }],
          });
          const errors = data?.cartLinesUpdate.userErrors ?? [];
          if (hasCartExpired(errors)) return get().clearCart();
          if (!errors.length) set({ items: get().items.map((entry) => entry.variantId === variantId ? { ...entry, quantity } : entry) });
        } finally {
          set({ isLoading: false });
        }
      },
      removeItem: async (variantId) => {
        const state = get();
        const item = state.items.find((entry) => entry.variantId === variantId);
        if (!state.cartId || !item?.lineId) return;
        set({ isLoading: true });
        try {
          const data = await storefrontApiRequest<{ cartLinesRemove: CartPayload }>(CART_LINES_REMOVE_MUTATION, {
            cartId: state.cartId,
            lineIds: [item.lineId],
          });
          const errors = data?.cartLinesRemove.userErrors ?? [];
          if (hasCartExpired(errors)) return get().clearCart();
          if (!errors.length) {
            const items = get().items.filter((entry) => entry.variantId !== variantId);
            items.length ? set({ items }) : get().clearCart();
          }
        } finally {
          set({ isLoading: false });
        }
      },
      syncCart: async () => {
        const { cartId, isSyncing } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest<{ cart: CartPayload["cart"] }>(CART_QUERY, { id: cartId });
          if (!data?.cart || data.cart.totalQuantity === 0) get().clearCart();
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items, cartId, checkoutUrl }) => ({ items, cartId, checkoutUrl }),
    },
  ),
);