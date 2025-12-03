'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar se já está logado
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        // Redirecionar baseado no perfil
        if (user.perfil === 'Administrador') {
          router.push('/');
        } else {
          router.push('/estoque');
        }
      }
    } catch (error) {
      // Não autenticado, continuar na página de login
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirecionar baseado no perfil
        if (data.user.perfil === 'Administrador') {
          router.push('/');
        } else {
          router.push('/estoque');
        }
        router.refresh();
      } else {
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Almoxerife
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sistema de Gestão de Almoxarifado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Usuário
              </label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                required
                value={formData.usuario}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu usuário"
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                required
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


