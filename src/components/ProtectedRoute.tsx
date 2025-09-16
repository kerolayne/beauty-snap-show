// src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

const ProtectedRoute = () => {
  const isAuth = isAuthenticated();

  // Se o usuário estiver autenticado, renderize o conteúdo da rota filha
  // Se não estiver, redirecione para a página de login
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;