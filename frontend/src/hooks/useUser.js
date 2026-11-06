import { useCallback } from 'react';
import { apiRequest } from '../api/client';
export function useUser() {
  const getMe = useCallback(() => apiRequest('/auth/me/'), []);
  return { getMe };
}
