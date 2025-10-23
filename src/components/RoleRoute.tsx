import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { UserRole } from '../types/auth';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleRoute = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}: RoleRouteProps) => {
  const { user, loading, isAdmin, isProvider, isClient } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  const hasRequiredRole = allowedRoles.some(role => {
    switch (role) {
      case 'admin':
        return isAdmin;
      case 'provider':
        return isProvider;
      case 'client':
        return isClient;
      default:
        return false;
    }
  });

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children || <Outlet />}</>;
};