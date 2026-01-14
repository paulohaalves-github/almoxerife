'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
              Almoxerife
            </Link>
          </div>

          {/* Navigation */}
          {!loading && user && (
            <nav className="hidden md:flex space-x-8 items-center">
              {/* Menu Administrativo com Dropdown - Apenas para Administradores */}
              {user.perfil === 'Administrador' && (
                <div 
                  className="relative"
                  onMouseEnter={() => setAdminMenuOpen(true)}
                  onMouseLeave={() => setAdminMenuOpen(false)}
                >
                  <button
                    className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    Administrativo
                    <svg
                      className={`w-4 h-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {adminMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg py-1 z-50 border border-zinc-200 dark:border-zinc-700">
                      <Link
                        href="/administrativo/dashboard"
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/administrativo/usuarios"
                        className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Usuários
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Menu Estoque */}
              <Link
                href="/estoque"
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Estoque
              </Link>

              {/* User Info e Logout */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.usuario} ({user.perfil})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sair
                </button>
              </div>
            </nav>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white p-2"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {!loading && user && mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-4">
            <div className="space-y-1">
              {/* Menu Administrativo - Apenas para Administradores */}
              {user.perfil === 'Administrador' && (
                <div className="px-3 py-2">
                  <button 
                    onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
                    className="w-full text-left text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-between"
                  >
                    Administrativo
                    <svg
                      className={`w-4 h-4 transition-transform ${mobileAdminOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileAdminOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      <Link
                        href="/administrativo/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/administrativo/usuarios"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                      >
                        Usuários
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <Link
                href="/estoque"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
              >
                Estoque
              </Link>
              <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-2">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {user.usuario} ({user.perfil})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

