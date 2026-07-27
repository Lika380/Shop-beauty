import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="container narrow">
      <h1>404</h1>
      <p>Страница не найдена.</p>
      <Link to="/">На главную</Link>
    </div>
  );
}
