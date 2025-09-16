// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe para navegação
import { login } from '../lib/auth'; // Importe a função de login
import { LoginCredentials } from '../types/beauty'; // Importe o tipo

const Login: React.FC = () => {
  const navigate = useNavigate(); // Hook para navegação
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa o erro anterior

    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      navigate('/dashboard'); // Redireciona para a página principal após o login
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao fazer login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;