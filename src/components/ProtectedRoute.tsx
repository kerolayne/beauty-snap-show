// src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se o usuário estiver autenticado, renderize o conteúdo da rota filha
  // Se não estiver, redirecione para a página de login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;