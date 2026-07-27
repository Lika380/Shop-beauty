import { NavLink, Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="container">
      <h1>Админ-панель</h1>
      <nav className="admin-nav">
        <NavLink to="/admin/products">Товары</NavLink>
        <NavLink to="/admin/categories">Категории</NavLink>
        <NavLink to="/admin/orders">Заказы</NavLink>
      </nav>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
