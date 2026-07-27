import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOrders } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { money, formatDate } from '../../utils/format';
import { ORDER_STATUSES, statusLabel } from '../../utils/orderStatus';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [userId, setUserId] = useState('');

  function load() {
    setLoading(true);
    setError(null);
    listOrders({ status: status || undefined, user_id: userId ? Number(userId) : undefined })
      .then((data) => setOrders(data.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [status, userId]);

  return (
    <div>
      <h2>Все заказы</h2>

      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')}>
          <option value="">Все статусы</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="ID пользователя"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <table className="orders-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Пользователь</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user_email ?? order.user_id}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>
                  <span className={`status-pill status-${order.status}`}>{statusLabel(order.status)}</span>
                </td>
                <td>{money(order.total)}</td>
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
