import { useState, useEffect, createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from './firebase';
import { AuthUser, UserProfile } from '@/types/auth';
import { getUserProfile } from './user-service';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isProvider: false,
  isClient: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    
    // Primeiro, tenta recuperar o usuário atual
    const currentUser = auth.currentUser;
    if (currentUser) {
      getUserProfile(currentUser.uid)
        .then(profile => {
          const authUser = {
            ...currentUser,
            profile
          } as AuthUser;
          setUser(authUser);
          setUserProfile(profile);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erro ao carregar perfil:', err);
          setError('Erro ao carregar perfil do usuário');
          setLoading(false);
        });
    }

    // Então configura o listener para mudanças
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Buscar o perfil do usuário
          const profile = await getUserProfile(firebaseUser.uid);
          const authUser = {
            ...firebaseUser,
            profile
          } as AuthUser;
          
          setUser(authUser);
          setUserProfile(profile);
          setError(null);
        } else {
          setUser(null);
          setUserProfile(null);
          setError(null);
        }
      } catch (err) {
        console.error('Erro ao processar alteração de autenticação:', err);
        setError('Erro ao atualizar estado do usuário');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userProfile?.role === 'admin';
  const isProvider = userProfile?.role === 'provider';
  const isClient = userProfile?.role === 'client';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      isAdmin,
      isProvider,
      isClient
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}