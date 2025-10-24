import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User, getAuth } from 'firebase/auth';
import { UserProfile, UserRole } from '@/types/auth';
import firebaseApp from './firebase';

const db = getFirestore(firebaseApp);

export async function createUserProfile(user: User, role: UserRole = 'client'): Promise<UserProfile> {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    phoneNumber: user.phoneNumber || '',
    role,
    createdAt: now,
    updatedAt: now,
  };

  // Se for um fornecedor, adiciona os campos específicos
  if (role === 'provider') {
    profile.provider = {
      specialties: [],
      availability: {},
    };
  }

  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    // Validação do UID
    if (!uid) {
      console.error('UID inválido ao buscar perfil');
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      console.log(`Perfil não encontrado para o UID: ${uid}, tentando criar...`);
      // Se o perfil não existe, podemos criar um perfil básico
      const auth = getAuth(firebaseApp);
      const firebaseUser = auth.currentUser;
      
      if (firebaseUser && firebaseUser.uid === uid) {
        return await createUserProfile(firebaseUser);
      }
      return null;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    // Re-throw com mensagem mais clara
    throw new Error('Não foi possível carregar o perfil do usuário. Por favor, tente novamente.');
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const updates = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function updateProviderAvailability(
  uid: string,
  availability: UserProfile['provider']['availability']
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    'provider.availability': availability,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateProviderSpecialties(
  uid: string,
  specialties: string[]
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    'provider.specialties': specialties,
    updatedAt: new Date().toISOString(),
  });
}