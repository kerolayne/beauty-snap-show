// src/lib/auth.ts

import { UserData, LoginCredentials } from '../types/beauty'; // Importe os tipos que você vai criar

const API_BASE_URL = 'http://sua-api.com/api'; // Substitua pelo endereço da sua API

/**
 * Função para fazer login do usuário.
 * @param credentials - As credenciais (email/username e senha) do usuário.
 * @returns Um objeto com os dados do usuário e o token.
 */
export async function login(credentials: LoginCredentials): Promise<UserData> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Se a resposta não for 200 OK, lança um erro com a mensagem da API
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha no login');
    }

    const userData = await response.json();
    // Salva o token de autenticação (ex: no localStorage)
    localStorage.setItem('authToken', userData.token);
    return userData;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
}

/**
 * Função para sair da sessão.
 */
export function logout(): void {
  // Remove o token de autenticação do armazenamento local
  localStorage.removeItem('authToken');
  // Opcional: Redirecionar o usuário ou limpar estados globais
}

/**
 * Função para verificar se o usuário está autenticado.
 * @returns Verdadeiro se o token existir, falso caso contrário.
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken');
  // Você pode adicionar uma verificação de validade do token aqui
  return !!token;
}