import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../lib/useAuth';
import { logout } from '../lib/auth';
import { useToast } from '../hooks/use-toast';

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user, isAdmin, isProvider, isClient } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isHome = pathname === '/';

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      })
      navigate('/')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
            >
              Beauty Scheduler
            </Link>
            
            <nav className="flex items-center gap-3">
              {user ? (
                <>
                  {isClient && (
                    <Button asChild variant="ghost">
                      <Link to="/booking">Agendar Serviço</Link>
                    </Button>
                  )}
                  {isProvider && (
                    <>
                      <Button asChild variant="ghost">
                        <Link to="/provider">Painel</Link>
                      </Button>
                      <Button asChild variant="ghost">
                        <Link to="/provider/services">Serviços</Link>
                      </Button>
                      <Button asChild variant="ghost">
                        <Link to="/provider/availability">Disponibilidade</Link>
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <Button asChild variant="ghost">
                      <Link to="/admin">Painel Admin</Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Criar conta</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {isHome && (
        <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Beauty Scheduler. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
