import { useAuth } from '../../hooks/useAuth';
import { WeatherWidget } from '../../components/WeatherWidget';
import { SoapWidget } from '../../components/SoapWidget';
export function Dashboard() {
  const { user, loginReceipt } = useAuth();
  const date = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Hermosillo' }).format(new Date());
  return <><div className="dashboard-intro"><div><p className="eyebrow">MI ESPACIO / RESUMEN</p><h1>Hola, {user.first_name || user.username}<span>.</span></h1><p className="muted">Qué bueno tenerte por aquí. Este es tu punto de partida.</p></div><div className="today"><span>HOY</span><p>{date}</p><span className="session-badge"><i /> Sesión activa</span></div></div>
    <div className="dashboard-grid"><WeatherWidget /><section className="panel profile-panel"><p className="eyebrow">HECHO PARA TI</p><div className="profile-title"><div className="avatar">{(user.first_name || user.username).charAt(0).toUpperCase()}</div><div><h2>{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</h2><span>@{user.username}</span></div></div><dl><div><dt>Correo electrónico</dt><dd>{user.email}</dd></div><div><dt>Teléfono</dt><dd>{user.telefono || 'Sin teléfono registrado'}</dd></div><div><dt>Mi cuenta</dt><dd>{user.is_active ? 'Activa' : 'Inactiva'}</dd></div></dl><p className="profile-note">Tu información está disponible solo al iniciar sesión.</p></section><SoapWidget /></div>
    <section className="dashboard-bottom"><div><p className="eyebrow">TODO EN SU LUGAR</p><h2>Tu cuenta está conectada.</h2><p className="muted">Puedes volver cuando quieras. Tu espacio te estará esperando.</p></div><span className="large-arrow" aria-hidden="true">↗</span></section>
    {loginReceipt && <details className="technical-detail auth-receipt"><summary>Registro de autenticación de esta sesión</summary><p>JWT recibido y validado mediante el endpoint protegido de datos personales.</p><pre>{JSON.stringify(loginReceipt, null, 2)}</pre><small>El token completo se oculta en este registro.</small></details>}
  </>;
}
