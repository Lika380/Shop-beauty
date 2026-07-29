import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/orders';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { money } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { getProductName } from '../utils/productNames';

export function Cart() {
  const { cart, loading, error, total, updateItem, removeItem, refresh } = useCart();
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleQuantityChange(itemId: number, quantity: number, stock: number) {
    if (quantity < 1) return;
    const clamped = Math.min(quantity, Math.max(stock, 1));
    setPendingId(itemId);
    try {
      await updateItem(itemId, clamped);
    } finally {
      setPendingId(null);
    }
  }

  async function handleRemove(itemId: number) {
    setPendingId(itemId);
    try {
      await removeItem(itemId);
    } finally {
      setPendingId(null);
    }
  }

  async function handleCheckout() {
    setCheckoutError(null);
    setPlacing(true);
    try {
      const order = await placeOrder();
      await refresh();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      setCheckoutError(getErrorMessage(err, 'Не удалось оформить заказ'));
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div className="container"><Loader /></div>;
  if (error) return <div className="container"><ErrorMessage message={error} /></div>;

  const items = cart?.items ?? [];
  const hasStockIssue = items.some((item) => item.quantity > item.stock_quantity || item.stock_quantity <= 0);

  return (
    <div className="container">
      <h1>Корзина</h1>

      {items.length === 0 ? (
        <p>
          Корзина пуста. <Link to="/">Перейти в каталог</Link>
        </p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Сумма</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Товар">{getProductName(item.product_id)}</td>
                  <td data-label="Цена">{money(item.price)}</td>
                  <td data-label="Количество">
                    <input
                      type="number"
                      min={1}
                      max={item.stock_quantity}
                      value={item.quantity}
                      disabled={pendingId === item.id || item.stock_quantity <= 0}
                      onChange={(e) =>
                        handleQuantityChange(item.id, Number(e.target.value) || 1, item.stock_quantity)
                      }
                    />
                    {item.quantity > item.stock_quantity && (
                      <p className="text-muted">В наличии: {item.stock_quantity} шт.</p>
                    )}
                  </td>
                  <td data-label="Сумма">{money(Number(item.price) * item.quantity)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-link danger"
                      disabled={pendingId === item.id}
                      onClick={() => handleRemove(item.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <p className="cart-total">Итого: {money(total)}</p>
            {hasStockIssue && (
              <p className="text-muted">
                Некоторых товаров нет в достаточном количестве — поправьте количество перед оформлением.
              </p>
            )}
            {checkoutError && <ErrorMessage message={checkoutError} />}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCheckout}
              disabled={placing || hasStockIssue}
            >
              {placing ? 'Оформляем…' : 'Оформить заказ'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
