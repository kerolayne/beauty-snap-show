import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
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
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() as UserProfile : null;
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