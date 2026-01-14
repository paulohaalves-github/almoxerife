'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recebimentosPorCategoria: [],
    saidasPorDestinatario: [],
    saidasPorSetor: [],
    saidasPorProduto: [],
    produtosEstoqueBaixo: [],
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');

      if (response.status === 403) {
        router.push('/estoque');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Erro ao carregar dados do dashboard');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Visão geral dos recebimentos, saídas e estoque
          </p>
        </div>

        {/* Seção: Recebimentos por Categoria */}
        <div className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Recebimentos por Categoria
            </h2>

            {/* Gráfico de Valor Total */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Valor Total por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.recebimentosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="categoria"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#71717a' }}
                  />
                  <YAxis tick={{ fill: '#71717a' }} />
                  <Tooltip
                    formatter={(value) => currencyFormatter.format(value)}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="valor_total" fill="#3b82f6" name="Valor Total (R$)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Quantidade */}
            <div>
              <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                Quantidade por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.recebimentosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="categoria"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#71717a' }}
                  />
                  <YAxis tick={{ fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="quantidade_total" fill="#10b981" name="Quantidade Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Grid de gráficos de saídas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Saídas por Destinatário */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Saídas por Destinatário (Top 10)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.saidasPorDestinatario} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#71717a' }} />
                <YAxis
                  type="category"
                  dataKey="destinatario"
                  width={150}
                  tick={{ fill: '#71717a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade_total" fill="#8b5cf6" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Saídas por Setor */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Saídas por Setor
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.saidasPorSetor}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ setor, percent }) => `${setor}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="quantidade_total"
                >
                  {stats.saidasPorSetor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Saídas por Produto */}
        <div className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Saídas por Produto (Top 10)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.saidasPorProduto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="produto"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#71717a' }}
                />
                <YAxis tick={{ fill: '#71717a' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade_total" fill="#ec4899" name="Quantidade Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Produtos com Estoque Baixo */}
        <div className="mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Produtos com Estoque Baixo (&lt; 5 unidades)
            </h2>
            {stats.produtosEstoqueBaixo.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Nenhum produto com estoque baixo no momento.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Fabricante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Estoque
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {stats.produtosEstoqueBaixo.map((produto) => (
                      <tr key={produto.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                          {produto.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {produto.categoria || 'Sem categoria'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                          {produto.fabricante || 'Não informado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              produto.quantidade_estoque === 0
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : produto.quantidade_estoque < 3
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            }`}
                          >
                            {produto.quantidade_estoque} unidades
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

