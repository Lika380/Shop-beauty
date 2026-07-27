import { apiRequest } from './client';
import type { AuthResponse, RegisterStepResponse } from '../types';

export function register(email: string, password: string): Promise<RegisterStepResponse> {
  return apiRequest<RegisterStepResponse>('/auth/register', { method: 'POST', body: { email, password } });
}

export function verify(email: string, code: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/verify', { method: 'POST', body: { email, code } });
}

export function resendVerification(email: string): Promise<RegisterStepResponse> {
  return apiRequest<RegisterStepResponse>('/auth/resend-verification', { method: 'POST', body: { email } });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}
