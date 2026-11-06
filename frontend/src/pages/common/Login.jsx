import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button } from 'semantic-ui-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
export function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate(); const location = useLocation();
  const [error, setError] = useState('');
  const formik = useFormik({ initialValues: { email: '', password: '' },
    validationSchema: Yup.object({ email: Yup.string().email('Escribe un correo válido.').required('Escribe tu correo.'), password: Yup.string().required('Escribe tu contraseña.') }),
    onSubmit: async (values) => { setError(''); try { await login(values); navigate(location.state?.from || '/dashboard', { replace: true }); } catch (err) { setError(err.message); } },
  });
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  return <section className="auth-card"><p className="eyebrow">BIENVENIDO DE NUEVO</p><h2>Entra a tu espacio.</h2><p className="muted">Nos alegra verte. Continúa con tu cuenta.</p>
    {location.state?.registered && <p className="success-message" role="status">Tu cuenta está lista. Ya puedes iniciar sesión.</p>}
    {error && <p className="error-message" role="alert">{error}</p>}
    <Form onSubmit={formik.handleSubmit} noValidate>
      <Form.Input id="login-email" label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" value={formik.values.email} onChange={(event) => { setError(''); formik.handleChange(event); }} onBlur={formik.handleBlur} error={formik.touched.email && formik.errors.email ? { content: formik.errors.email } : false} />
      <Form.Input id="login-password" label="Contraseña" name="password" type="password" placeholder="Tu contraseña" autoComplete="current-password" value={formik.values.password} onChange={(event) => { setError(''); formik.handleChange(event); }} onBlur={formik.handleBlur} error={formik.touched.password && formik.errors.password ? { content: formik.errors.password } : false} />
      <Button primary fluid type="submit" loading={formik.isSubmitting} disabled={formik.isSubmitting}>Iniciar sesión <span aria-hidden="true">↗</span></Button>
    </Form><p className="auth-switch">¿Es tu primera visita? <Link to="/register">Crea tu cuenta</Link></p><p className="auth-note">Tu información, siempre en tu espacio.</p>
  </section>;
}
