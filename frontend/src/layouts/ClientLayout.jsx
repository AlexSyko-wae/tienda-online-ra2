import { Link, Outlet } from 'react-router-dom';
export function ClientLayout() { return <div><header className="topbar"><Link className="brand" to="/">t<span>o</span> / tienda online</Link><Link to="/login">Entrar a mi cuenta ↗</Link></header><Outlet /></div>; }
