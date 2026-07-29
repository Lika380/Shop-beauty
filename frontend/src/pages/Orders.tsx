import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../api/orders';
import type { Order } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { money, formatDate } from '../utils/format';
import { statusLabel } from '../utils/orderStatus';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then((data) => setOrders(data.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><Loader /></div>;
  if (error) return <div className="container"><ErrorMessage message={error} /></div>;

  return (
    <div className="container">
      <h1>Мои заказы</h1>
      {orders.length === 0 ? (
        <p>Заказов пока нет.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td data-label="№">#{order.id}</td>
                <td data-label="Дата">{formatDate(order.created_at)}</td>
                <td data-label="Статус">
                  <span className={`status-pill status-${order.status}`}>{statusLabel(order.status)}</span>
                </td>
                <td data-label="Сумма">{money(order.total)}</td>
                <td>
                  <Link to={`/orders/${order.id}`}>Подробнее</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
