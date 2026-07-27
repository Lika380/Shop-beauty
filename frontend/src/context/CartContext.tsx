import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as cartApi from '../api/cart';
import type { Cart } from '../types';
import { toNumber } from '../utils/format';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  total: number;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить корзину');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: number, quantity: number) => {
      await cartApi.addCartItem(productId, quantity);
      await refresh();
    },
    [refresh],
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => {
      await cartApi.updateCartItem(itemId, quantity);
      await refresh();
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await cartApi.removeCartItem(itemId);
      await refresh();
    },
    [refresh],
  );

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const total = useMemo(
    () => cart?.items.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo<CartContextValue>(
    () => ({ cart, loading, error, itemCount, total, refresh, addItem, updateItem, removeItem }),
    [cart, loading, error, itemCount, total, refresh, addItem, updateItem, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
