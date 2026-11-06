import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Form } from 'semantic-ui-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerApi } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
export function Register() {
  const navigate = useNavigate(); const { user } = useAuth(); const [error, setError] = useState('');
  const formik = useFormik({ initialValues: { first_name: '', username: '', email: '', telefono: '', password: '', password_confirm: '' },
    validationSchema: Yup.object({ first_name: Yup.string().max(150).required('Escribe tu nombre.'), username: Yup.string().matches(/^[\w.@+-]+$/, 'Usa letras, números o . @ + - _').max(150).required('Elige tu usuario.'), email: Yup.string().email('Escribe un correo válido.').required('Escribe tu correo.'), telefono: Yup.string().max(20, 'Máximo 20 caracteres.'), password: Yup.string().min(8, 'Usa al menos 8 caracteres.').required('Elige una contraseña.'), password_confirm: Yup.string().oneOf([Yup.ref('password')], 'Las contraseñas no coinciden.').required('Confirma tu contraseña.') }),
    onSubmit: async (values) => { setError(''); try { await registerApi(values); navigate('/login', { replace: true, state: { registered: true } }); } catch (err) { setError(err.message); const fields = {}; for (const [key, value] of Object.entries(err.fields || {})) if (key in values) fields[key] = Array.isArray(value) ? value.join(' ') : String(value); formik.setErrors(fields); } },
  });
  if (user) return <Navigate to="/dashboard" replace />;
  const field = (name, label, type = 'text', extra = {}) => <Form.Input key={name} id={`register-${name}`} name={name} label={label} type={type} value={formik.values[name]} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched[name] && formik.errors[name] ? { content: formik.errors[name] } : false} {...extra} />;
  return <section className="auth-card register-card"><p className="eyebrow">TU PRIMER PASO</p><h2>Hazlo tuyo.</h2><p className="muted">Crea tu cuenta y empieza a explorar.</p>{error && <p role="alert" className="error-message">{error}</p>}
    <Form onSubmit={formik.handleSubmit} noValidate><div className="form-pair">{field('first_name', 'Nombre', 'text', { autoComplete: 'given-name' })}{field('username', 'Usuario', 'text', { autoComplete: 'username' })}</div>
      {field('email', 'Correo electrónico', 'email', { autoComplete: 'email' })}{field('telefono', 'Teléfono (opcional)', 'tel', { autoComplete: 'tel' })}
      {field('password', 'Contraseña', 'password', { autoComplete: 'new-password' })}{field('password_confirm', 'Confirmar contraseña', 'password', { autoComplete: 'new-password' })}
      <Button primary fluid type="submit" loading={formik.isSubmitting} disabled={formik.isSubmitting}>Crear mi cuenta ↗</Button></Form><p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
  </section>;
}
