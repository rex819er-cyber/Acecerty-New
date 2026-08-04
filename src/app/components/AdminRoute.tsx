import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { hasAdminSession } from '../lib/adminAuth';

/**
 * Guards every /admin/* route. When `admin_access_token` is missing the
 * visitor is redirected straight to /admin/login, carrying the attempted
 * path so the login page can return them there afterwards.
 */
export function AdminRoute() {
  const location = useLocation();

  if (!hasAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ returnTo: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
