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

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar o perfil do usuário
        const profile = await getUserProfile(firebaseUser.uid);
        const authUser = {
          ...firebaseUser,
          profile
        } as AuthUser;
        
        setUser(authUser);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
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