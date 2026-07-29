import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct, type ProductInput } from '../../api/products';
import { listCategories } from '../../api/categories';
import type { Category } from '../../types';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';

const emptyForm: ProductInput = {
  name: '',
  description: '',
  price: 0,
  stock_quantity: 0,
  category_id: null,
  image_url: '',
};

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((p) =>
        setForm({
          name: p.name,
          description: p.description ?? '',
          price: Number(p.price),
          stock_quantity: p.stock_quantity,
          category_id: p.category_id,
          image_url: p.image_url ?? '',
        }),
      )
      .catch((err) => setError(err instanceof Error ? err.message : 'Товар не найден'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: ProductInput = {
        ...form,
        description: form.description?.trim() || null,
        image_url: form.image_url?.trim() || null,
      };
      if (isEdit && id) {
        await updateProduct(Number(id), payload);
      } else {
        await createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div>
      <h2>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h2>
      <form className="form" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        <label>
          Название
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label>
          Описание
          <textarea
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </label>
        <label>
          Цена
          <input
            type="number"
            step="0.01"
            min={0}
            required
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
        </label>
        <label>
          Остаток на складе
          <input
            type="number"
            min={0}
            required
            value={form.stock_quantity}
            onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) }))}
          />
        </label>
        <label>
          Категория
          <select
            value={form.category_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value ? Number(e.target.value) : null }))}
          >
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ссылка на изображение
          <input
            type="url"
            value={form.image_url ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
