import { apiRequest } from './client';
import type { Order, OrderStatus, Paginated } from '../types';

export interface OrderQuery {
  status?: OrderStatus | '';
  user_id?: number;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

export function placeOrder(): Promise<Order> {
  return apiRequest<Order>('/orders', { method: 'POST' });
}

export function listOrders(query: OrderQuery = {}): Promise<Paginated<Order>> {
  return apiRequest('/orders', { query });
}

export function getOrder(id: number | string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`);
}

export function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status } });
}
