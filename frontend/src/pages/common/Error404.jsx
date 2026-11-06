import { Link } from 'react-router-dom';
export function Error404() { return <section className="auth-card"><p className="eyebrow">404</p><h2>Esta página no está aquí.</h2><p>Vuelve a tu espacio para continuar.</p><Link to="/dashboard">Ir al Dashboard ↗</Link></section>; }
