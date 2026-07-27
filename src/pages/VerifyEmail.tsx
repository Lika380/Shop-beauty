import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { getErrorMessage } from '../utils/errors';

interface LocationState {
  email?: string;
  devCode?: string;
  reason?: 'unverified-login';
}

export function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const [email, setEmail] = useState(state.email ?? '');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(state.devCode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyEmail(email, code);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось подтвердить email'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);
    setResending(true);
    try {
      const res = await resendVerification(email);
      setDevCode(res.dev_verification_code);
      setResendMessage('Новый код отправлен на почту.');
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось отправить код повторно'));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Подтверждение email</h1>
      <p>
        Мы отправили 6-значный код на <strong>{email || 'вашу почту'}</strong>. Введите его ниже, чтобы
        завершить регистрацию.
      </p>

      {state.reason === 'unverified-login' && (
        <p className="text-muted">Ваш email ещё не подтверждён — введите код, чтобы войти.</p>
      )}

      {devCode && (
        <p className="success-text">Dev-режим: код подтверждения — {devCode}</p>
      )}

      <form className="form" onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}
        {resendMessage && <p className="success-text">{resendMessage}</p>}
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
          Код из письма
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            autoComplete="one-time-code"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting || code.length !== 6}>
          {submitting ? 'Проверяем…' : 'Подтвердить'}
        </button>
      </form>

      <button type="button" className="btn-link" disabled={resending || !email} onClick={handleResend}>
        {resending ? 'Отправляем…' : 'Отправить код ещё раз'}
      </button>

      <p>
        <Link to="/login">Назад ко входу</Link>
      </p>
    </div>
  );
}
