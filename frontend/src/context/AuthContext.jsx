import { createContext, useCallback, useEffect, useState } from 'react';
import { clearTokens, getMeWithToken, getTokens, loginApi, saveTokens } from '../api/client';
import { useUser } from '../hooks/useUser';
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { getMe } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [loginReceipt, setLoginReceipt] = useState(null);
  const logout = useCallback(() => {
    clearTokens(); setUser(null); setSessionError(''); setLoginReceipt(null);
  }, []);

  useEffect(() => {
    let active = true;
    async function restore() {
      if (!getTokens()) { if (active) setLoading(false); return; }
      try {
        const me = await getMe();
        if (active && getTokens()) setUser(me);
      } catch (error) {
        if (active && error.status !== 401 && error.status !== 400) setSessionError(error.message);
      } finally { if (active) setLoading(false); }
    }
    restore();
    window.addEventListener('session-expired', logout);
    return () => { active = false; window.removeEventListener('session-expired', logout); };
  }, [logout, getMe]);

  const login = async (credentials) => {
    const tokens = await loginApi(credentials);
    // Se valida el token contra Django antes de marcar al usuario como autenticado.
    const me = await getMeWithToken(tokens.access);
    saveTokens(tokens); setUser(me); setSessionError('');
    const receipt = { access: 'recibido', refresh: 'recibido', status: 200,
      tokenPreview: `${tokens.access.slice(0, 12)}…[oculto]`, user: me.username };
    setLoginReceipt(receipt);
    // Evidencia de desarrollo: confirma el token sin publicar credenciales completas.
    console.info('[Auth] JWT obtenido', receipt);
    return me;
  };
  return <AuthContext.Provider value={{ user, loading, sessionError, login, logout, loginReceipt }}>{children}</AuthContext.Provider>;
}
