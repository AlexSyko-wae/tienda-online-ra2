import { Link, Outlet } from 'react-router-dom';
export function CommonLayout() {
  return <div className="auth-shell"><aside className="auth-story">
    <Link className="brand brand-light" to="/">t<span>o</span> / tienda online</Link>
    <div className="story-copy"><p className="eyebrow light">TU TIENDA, MÁS CERCA</p><h1>Todo empieza<br />con una buena<br /><em>conexión.</em></h1>
      <p>Tu cuenta, tus datos y un espacio para descubrir lo que viene.</p></div>
    <div className="story-bottom"><span className="orbit">↗</span><span>Un solo lugar.<br />Muchas posibilidades.</span><small>01 / MI ESPACIO</small></div>
  </aside><main className="auth-main"><Outlet /></main></div>;
}
