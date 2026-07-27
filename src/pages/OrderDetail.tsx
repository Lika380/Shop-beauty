import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api/orders';
import type { Order } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { money, formatDate } from '../utils/format';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { getProductName } from '../utils/productNames';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(id)
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err, 'Заказ не найден')))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(newStatus: string) {
    if (!order) return;
    setStatusUpdating(true);
    setStatusError(null);
    try {
      const updated = await updateOrderStatus(order.id, newStatus as Order['status']);
      setOrder((prev) => (prev ? { ...prev, ...updated, items: updated.items ?? prev.items } : updated));
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Не удалось изменить статус');
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loading) return <div className="container"><Loader /></div>;
  if (error || !order) return <div className="container"><ErrorMessage message={error ?? 'Заказ не найден'} /></div>;

  return (
    <div className="container">
      <Link to={isAdmin ? '/admin/orders' : '/orders'} className="back-link">
        ← К списку заказов
      </Link>
      <h1>Заказ #{order.id}</h1>
      <p>Дата: {formatDate(order.created_at)}</p>
      {order.user_email && <p>Покупатель: {order.user_email}</p>}

      <div className="order-status-row">
        <span className={`status-pill status-${order.status}`}>{statusLabel(order.status)}</span>
        {isAdmin && (
          <select value={order.status} disabled={statusUpdating} onChange={(e) => handleStatusChange(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        )}
      </div>
      {statusError && <ErrorMessage message={statusError} />}

      <table className="orders-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Кол-во</th>
            <th>Цена на момент покупки</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item) => (
            <tr key={item.id}>
              <td>{getProductName(item.product_id)}</td>
              <td>{item.quantity}</td>
              <td>{money(item.price_at_purchase)}</td>
              <td>{money(Number(item.price_at_purchase) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="cart-total">Итого: {money(order.total)}</p>
    </div>
  );
}
