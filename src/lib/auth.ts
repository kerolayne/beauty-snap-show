// src/lib/auth.ts

import { apiClient, UserResponse } from './api';
import { LoginCredentials, UserData } from '../types/beauty';

/**
 * Função para fazer login do usuário.
 * @param credentials - As credenciais (email e senha) do usuário.
 * @returns Um objeto com os dados do usuário e o token.
 */
export async function login(credentials: LoginCredentials): Promise<UserData> {
  try {
    const userResponse = await apiClient.login(credentials);
    
    // Convert UserResponse to UserData format
    const userData: UserData = {
      id: userResponse.id,
      name: userResponse.name,
      email: userResponse.email,
      token: localStorage.getItem('authToken') || '',
    };
    
    return userData;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

/**
 * Função para sair da sessão.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.logout();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    // Even if logout request fails, clear local storage
    localStorage.removeItem('authToken');
  }
}

/**
 * Função para verificar se o usuário está autenticado.
 * @returns Verdadeiro se o token existir, falso caso contrário.
 */
export function isAuthenticated(): boolean {
  return apiClient.isAuthenticated();
}