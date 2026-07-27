import { apiRequest } from './client';
import type { Cart } from '../types';

export function getCart(): Promise<Cart> {
  return apiRequest<Cart>('/cart');
}

export function addCartItem(product_id: number, quantity: number): Promise<unknown> {
  return apiRequest('/cart/items', { method: 'POST', body: { product_id, quantity } });
}

export function updateCartItem(id: number, quantity: number): Promise<unknown> {
  return apiRequest(`/cart/items/${id}`, { method: 'PUT', body: { quantity } });
}

export function removeCartItem(id: number): Promise<unknown> {
  return apiRequest(`/cart/items/${id}`, { method: 'DELETE' });
}
