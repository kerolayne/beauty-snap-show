// src/lib/auth.ts
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { LoginCredentials, UserData } from '../types/beauty';
import firebaseApp from './firebase';

const auth = getAuth(firebaseApp);

// Configura a persistência para LOCAL
import { browserLocalPersistence, setPersistence } from 'firebase/auth';

// Configura persistência logo ao inicializar
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Erro ao configurar persistência:', error);
  });

// Verifica se há uma sessão ativa
export const checkSession = (): Promise<User | null> => {
  return new Promise((resolve) => {
    // Primeiro verifica se já tem um usuário
    const currentUser = auth.currentUser;
    if (currentUser) {
      resolve(currentUser);
      return;
    }

    // Se não tiver, aguarda o evento de mudança de estado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Função para fazer login do usuário usando Firebase Authentication.
 * @param credentials - As credenciais (email e senha) do usuário.
 * @returns Um objeto com os dados do usuário.
 */
export async function login(credentials: LoginCredentials): Promise<UserData> {
  try {
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Convert Firebase User to UserData format
    const userData: UserData = {
      id: user.uid,
      name: user.displayName || email.split('@')[0], // Fallback to email username if no display name
      email: user.email!,
      token: await user.getIdToken(),
    };
    
    return userData;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    throw new Error(getFirebaseAuthErrorMessage(error.code));
  }
}

/**
 * Função para criar uma nova conta de usuário.
 * @param credentials - As credenciais (email e senha) do usuário.
 * @returns Um objeto com os dados do usuário.
 */
export async function signup(credentials: LoginCredentials): Promise<UserData> {
  try {
    const { email, password } = credentials;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userData: UserData = {
      id: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email!,
      token: await user.getIdToken(),
    };
    
    return userData;
  } catch (error: any) {
    console.error('Erro ao criar conta:', error);
    throw new Error(getFirebaseAuthErrorMessage(error.code));
  }
}

/**
 * Função para sair da sessão.
 */
export async function logout(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('authUser');
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error);
    throw new Error(getFirebaseAuthErrorMessage(error.code));
  }
}

/**
 * Função para verificar se o usuário está autenticado.
 * @returns Verdadeiro se houver um usuário autenticado, falso caso contrário.
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Função para observar mudanças no estado de autenticação.
 * @param callback - Função chamada quando o estado de autenticação muda.
 * @returns Uma função para cancelar a observação.
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Função auxiliar para traduzir códigos de erro do Firebase Authentication.
 */
function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso.';
    case 'auth/weak-password':
      return 'A senha é muito fraca.';
    default:
      return 'Ocorreu um erro durante a autenticação.';
  }
}