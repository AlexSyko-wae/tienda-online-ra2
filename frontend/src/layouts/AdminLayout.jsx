import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
export function AdminLayout() {
  const { user, loading, sessionError, logout } = useAuth();
  const location = useLocation();
  if (loading) return <main className="center-screen" role="status">Recuperando tu sesión…</main>;
  if (sessionError) return <main className="center-screen"><h1>No pudimos verificar tu sesión</h1><p>{sessionError}</p><button onClick={() => window.location.reload()}>Reintentar</button><button onClick={logout}>Volver a iniciar sesión</button></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <div className="dashboard-shell"><header className="topbar"><Link className="brand" to="/">t<span>o</span> / tienda online</Link><nav aria-label="Navegación principal"><Link className="active-nav" to="/dashboard">Mi espacio</Link><span className="nav-user">{user.username}</span><button className="text-button" onClick={logout}>Cerrar sesión ↗</button></nav></header><main className="dashboard-main"><Outlet /></main><footer className="app-footer"><span>Tienda Online · Mi espacio</span><span>Hecho para conectar.</span></footer></div>;
}
