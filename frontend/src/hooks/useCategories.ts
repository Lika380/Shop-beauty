import { useEffect, useState } from 'react';
import { listCategories } from '../api/categories';
import type { Category } from '../types';

let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

function fetchCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = listCategories().then((data) => {
      cache = data;
      return data;
    });
  }
  return inflight;
}

export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>(cache ?? []);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return categories;
}

export function useCategoryName(categoryId: number | null): string | undefined {
  const categories = useCategories();
  if (categoryId == null) return undefined;
  return categories.find((c) => c.id === categoryId)?.name;
}
