import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { getErrorCode, getErrorMessage } from '../utils/errors';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailTaken(false);

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(email, password);
      navigate('/verify-email', {
        replace: true,
        state: { email: res.email, devCode: res.dev_verification_code },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось зарегистрироваться'));
      setEmailTaken(getErrorCode(err) === 'EMAIL_TAKEN');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Регистрация</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage
            message={emailTaken ? `${error} Уже есть аккаунт? Войдите.` : error}
          />
        )}
        {emailTaken && (
          <p>
            <Link to="/login" state={{ email }}>
              Перейти на страницу входа
            </Link>
          </p>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label>
          Повторите пароль
          <input
            type="password"
            value={confirm}
            required
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Регистрируем…' : 'Зарегистрироваться'}
        </button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
