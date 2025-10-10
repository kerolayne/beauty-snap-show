import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
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
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Create account</Link>
              </Button>
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
