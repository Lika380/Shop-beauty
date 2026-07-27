import { apiRequest } from './client';
import type { Category } from '../types';

export function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

export function createCategory(name: string): Promise<Category> {
  return apiRequest<Category>('/categories', { method: 'POST', body: { name } });
}
