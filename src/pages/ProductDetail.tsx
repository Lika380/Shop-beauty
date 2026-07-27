import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../api/products';
import type { Product } from '../types';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { money } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategoryName } from '../hooks/useCategories';
import { getProductImage } from '../utils/productImage';
import { getProductName } from '../utils/productNames';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState<'idle' | 'adding' | 'added' | 'error'>('idle');
  const [addError, setAddError] = useState<string | null>(null);
  const categoryName = useCategoryName(product?.category_id ?? null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Товар не найден'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;
    setAddState('adding');
    setAddError(null);
    try {
      await addItem(product.id, quantity);
      setAddState('added');
    } catch (err) {
      setAddState('error');
      setAddError(err instanceof Error ? err.message : 'Не удалось добавить в корзину');
    }
  }

  if (loading) return <div className="container"><Loader /></div>;
  if (error || !product) return <div className="container"><ErrorMessage message={error ?? 'Товар не найден'} /></div>;

  const outOfStock = product.stock_quantity <= 0;
  const displayName = getProductName(product.id);

  return (
    <div className="container">
      <Link to="/" className="back-link">
        ← К каталогу
      </Link>
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={getProductImage(product.id)} alt={displayName} />
        </div>
        <div className="product-detail-info">
          <h1>{displayName}</h1>
          {categoryName && <p className="product-card-category">{categoryName}</p>}
          <p className="product-detail-price">{money(product.price)}</p>
          <p className="product-detail-stock">
            {outOfStock ? 'Нет в наличии' : `В наличии: ${product.stock_quantity} шт.`}
          </p>
          {product.description && <p className="product-detail-description">{product.description}</p>}

          {!isAdmin && (
            <div className="add-to-cart">
              <input
                type="number"
                min={1}
                max={outOfStock ? 1 : product.stock_quantity}
                value={quantity}
                disabled={outOfStock}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <button
                type="button"
                className="btn btn-primary"
                disabled={outOfStock || addState === 'adding'}
                onClick={handleAddToCart}
              >
                {addState === 'adding' ? 'Добавляем…' : 'Добавить в корзину'}
              </button>
              {addState === 'added' && <span className="success-text">Добавлено!</span>}
              {addState === 'error' && addError && <ErrorMessage message={addError} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
