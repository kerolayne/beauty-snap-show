import { User } from 'firebase/auth';

export type UserRole = 'client' | 'provider' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  // Campos específicos para fornecedores
  provider?: {
    specialties: string[];
    description?: string;
    availability?: {
      [key: string]: { // dia da semana (0-6)
        start: string; // formato HH:mm
        end: string;
        break?: {
          start: string;
          end: string;
        };
      };
    };
  };
}

export interface AuthUser extends Omit<User, 'providerData'> {
  profile?: UserProfile;
}