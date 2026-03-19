"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, CartItem } from "./api";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface CartState {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (cardId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getCart();
      setCartItems(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (cardId: string, quantity = 1) => {
      try {
        await apiAddToCart({ card_id: cardId, quantity });
        toast.success("Added to cart!", { description: "Item has been added to your bag." });
        await refreshCart();
      } catch {
        toast.error("Failed to add to cart");
      }
    },
    [refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        await apiRemoveFromCart(itemId);
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.success("Removed from cart");
      } catch {
        toast.error("Failed to remove from cart");
      }
    },
    []
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, loading, addToCart, removeFromCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
