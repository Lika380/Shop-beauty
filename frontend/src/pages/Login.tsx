import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { getErrorCode, getErrorMessage } from '../utils/errors';

interface LocationState {
  from?: { pathname: string };
  email?: string;
}

export function Login() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const [email, setEmail] = useState(state.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = state.from?.pathname ?? '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (getErrorCode(err) === 'EMAIL_NOT_VERIFIED') {
        let devCode: string | undefined;
        try {
          const resend = await resendVerification(email);
          devCode = resend.dev_verification_code;
        } catch {
        }
        navigate('/verify-email', { state: { email, devCode, reason: 'unverified-login' } });
        return;
      }
      setError(getErrorMessage(err, 'Не удалось войти'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Вход</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
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
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Входим…' : 'Войти'}
        </button>
      </form>
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
