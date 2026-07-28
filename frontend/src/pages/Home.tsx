import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listProducts } from '../api/products';
import { listCategories } from '../api/categories';
import type { Category, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

const LIMIT = 12;

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const category = searchParams.get('category') ?? '';
  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listProducts({
      category: category ? Number(category) : undefined,
      search: search || undefined,
      sort: (sort as 'price_asc' | 'price_desc') || undefined,
      page,
      limit: LIMIT,
    })
      .then((data) => {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages || 1);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить товары'))
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  }

  function goToPage(p: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  }

  return (
    <>
      <div className="hero">
        <img src={`${import.meta.env.BASE_URL}bg.webp`} alt="" />
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-eyebrow">Скидки дня</p>
            <h1>Скидки до &minus;60%</h1>
            <p className="hero-subtitle">Выбирайте любимые товары дешевле, чем обычно</p>
            <a
              href="#catalog"
              className="hero-cta"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Смотреть каталог →
            </a>
          </div>
        </div>
      </div>

      <div className="container" id="catalog">
        <div className="filters">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Поиск товаров…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn">
              Найти
            </button>
          </form>

          <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            <option value="">Сортировка по умолчанию</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
          </select>
        </div>

        {loading && <Loader />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && products.length === 0 && <p>Товары не найдены.</p>}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </div>
    </>
  );
}
