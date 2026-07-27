import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteProduct, listProducts } from '../../api/products';
import type { Product } from '../../types';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Pagination } from '../../components/Pagination';
import { money } from '../../utils/format';

const LIMIT = 20;

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    listProducts({ page, limit: LIMIT })
      .then((data) => {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages || 1);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить товары'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function handleDelete(id: number) {
    if (!confirm('Удалить товар?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить товар');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Товары</h2>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Новый товар
        </Link>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.stock_quantity}</td>
                  <td className="row-actions">
                    <Link to={`/admin/products/${p.id}/edit`}>Редактировать</Link>
                    <button
                      type="button"
                      className="btn-link danger"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
