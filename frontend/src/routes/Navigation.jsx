import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CommonLayout } from '../layouts/CommonLayout';
import { ClientLayout } from '../layouts/ClientLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { Login } from '../pages/common/Login';
import { Register } from '../pages/common/Register';
import { Error404 } from '../pages/common/Error404';
import { Home } from '../pages/client/Home';
import { Dashboard } from '../pages/admin/Dashboard';
export function Navigation() { return <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes>
  <Route element={<ClientLayout />}><Route path="/" element={<Home />} /></Route>
  <Route element={<CommonLayout />}><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="*" element={<Error404 />} /></Route>
  <Route element={<AdminLayout />}><Route path="/dashboard" element={<Dashboard />} /></Route>
</Routes></BrowserRouter>; }
