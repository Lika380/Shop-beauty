import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className={isHome ? 'site-header header--overlay' : 'site-header'}>
      <div className="container header-inner">
        <Link to="/" className="brand">
          Shop Beauty
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end>
            Каталог
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders">Мои заказы</NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin/products">Товары</NavLink>
              <NavLink to="/admin/categories">Категории</NavLink>
              <NavLink to="/admin/orders">Заказы</NavLink>
            </>
          )}
        </nav>
        <div className="header-actions">
          {!isAdmin && (
            <Link to="/cart" className="cart-link">
              Корзина
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-email">{user?.email}</span>
              <button type="button" className="btn-link" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Войти</Link>
              <Link to="/register">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
