import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Sistema de Almoxarifado
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Controle completo de estoque e saídas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/estoque"
            className="block p-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Estoque
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Gerencie produtos e monitore o estoque do almoxarifado. Cadastre, edite e visualize todos os produtos disponíveis.
            </p>
          </Link>

          <Link
            href="/estoque/saidas"
            className="block p-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Saídas
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Registre as saídas de produtos e mantenha um histórico completo de todas as movimentações do almoxarifado.
            </p>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Use o menu acima para navegar pelo sistema
          </p>
        </div>
      </main>
    </div>
  );
}
