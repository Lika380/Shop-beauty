import { useEffect, useState, type FormEvent } from 'react';
import { createCategory, listCategories } from '../../api/categories';
import type { Category } from '../../types';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listCategories()
      .then(setCategories)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить категории'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createCategory(name.trim());
      setName('');
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось создать категорию');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Категории</h2>

      <form className="form inline-form" onSubmit={handleSubmit}>
        {formError && <ErrorMessage message={formError} />}
        <input
          type="text"
          placeholder="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          Добавить
        </button>
      </form>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
