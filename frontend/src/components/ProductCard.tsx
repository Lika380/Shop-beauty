import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { money } from '../utils/format';
import { useCategoryName } from '../hooks/useCategories';
import { getProductImage } from '../utils/productImage';
import { getProductName } from '../utils/productNames';

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock_quantity <= 0;
  const categoryName = useCategoryName(product.category_id);
  const displayName = getProductName(product.id);

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={getProductImage(product.id)} alt={displayName} loading="lazy" />
        {outOfStock && <span className="badge badge-out">Нет в наличии</span>}
      </div>
      <div className="product-card-body">
        <h3>{displayName}</h3>
        {categoryName && <p className="product-card-category">{categoryName}</p>}
        <p className="product-card-price">{money(product.price)}</p>
      </div>
    </Link>
  );
}
