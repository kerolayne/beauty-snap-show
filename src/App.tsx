import React, { lazy, Suspense } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { TrabalhoDetails } from "./pages/TrabalhoDetails";
import { Avaliacoes } from "./pages/Avaliacoes";
import { Booking } from "./pages/Booking";
import { RoleRoute } from "./components/RoleRoute";
import { AuthProvider } from "./lib/useAuth";

// Lazy load admin and provider pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProviderDashboard = lazy(() => import('./pages/provider/Dashboard'));
const ProviderServices = lazy(() => import('./pages/provider/Services'));
const ProviderAvailability = lazy(() => import('./pages/provider/Availability'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Client Routes */}
              <Route element={<RoleRoute allowedRoles={['client', 'admin']} />}>
                <Route path="/trabalho-details/:id" element={<TrabalhoDetails />} />
                <Route path="/avaliacoes/:id" element={<Avaliacoes />} />
                <Route path="/booking" element={<Booking />} />
              </Route>

              {/* Provider Routes */}
              <Route element={<RoleRoute allowedRoles={['provider', 'admin']} />}>
                <Route path="/provider" element={
                  <Suspense fallback={<div>Carregando...</div>}>
                    <ProviderDashboard />
                  </Suspense>
                } />
                <Route path="/provider/services" element={
                  <Suspense fallback={<div>Carregando...</div>}>
                    <ProviderServices />
                  </Suspense>
                } />
                <Route path="/provider/availability" element={
                  <Suspense fallback={<div>Carregando...</div>}>
                    <ProviderAvailability />
                  </Suspense>
                } />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={
                  <Suspense fallback={<div>Carregando...</div>}>
                    <AdminDashboard />
                  </Suspense>
                } />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;