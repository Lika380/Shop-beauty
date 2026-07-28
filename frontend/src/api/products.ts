import { apiRequest } from './client';
import type { Paginated, Product } from '../types';

export interface ProductQuery {
  category?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc';
  [key: string]: string | number | undefined;
}

export function listProducts(query: ProductQuery): Promise<Paginated<Product>> {
  return apiRequest<Paginated<Product>>('/products', { query });
}

export function getProduct(id: number | string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`);
}

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  category_id?: number | null;
  image_url?: string | null;
}

export function createProduct(input: ProductInput): Promise<Product> {
  return apiRequest<Product>('/products', { method: 'POST', body: input });
}

export function updateProduct(id: number, input: ProductInput): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, { method: 'PUT', body: input });
}

export function deleteProduct(id: number): Promise<void> {
  return apiRequest<void>(`/products/${id}`, { method: 'DELETE' });
}
