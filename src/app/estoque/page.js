'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function EstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [fabricanteFiltro, setFabricanteFiltro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);

  useEffect(() => {
    carregarFiltros();
    carregarProdutos();
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [categoriaFiltro, fabricanteFiltro]);

  const carregarFiltros = async () => {
    try {
      const response = await fetch('/api/produtos/filtros');
      const data = await response.json();
      
      if (response.ok) {
        setCategorias(data.categorias || []);
        setFabricantes(data.fabricantes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (busca) params.append('busca', busca);
      if (categoriaFiltro) params.append('categoria', categoriaFiltro);
      if (fabricanteFiltro) params.append('fabricante', fabricanteFiltro);
      
      const url = params.toString() 
        ? `/api/produtos?${params.toString()}`
        : '/api/produtos';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setProdutos(data);
      } else {
        console.error('Erro ao carregar produtos:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusca = (e) => {
    e.preventDefault();
    carregarProdutos();
  };

  const limparFiltros = () => {
    setBusca('');
    setCategoriaFiltro('');
    setFabricanteFiltro('');
    carregarProdutos();
  };

  const temFiltrosAtivos = busca || categoriaFiltro || fabricanteFiltro;

  const exportarParaXLSX = () => {
    if (produtos.length === 0) {
      alert('Não há produtos para exportar.');
      return;
    }

    // Preparar dados para exportação
    const dadosExportacao = produtos.map((produto) => ({
      ID: produto.id,
      Nome: produto.nome,
      Categoria: produto.categoria || '-',
      Fabricante: produto.fabricante || '-',
      Descrição: produto.descricao || '-',
      Prateleira: produto.prateleira || '-',
      Alocação: produto.alocacao || '-',
      'Quantidade em Estoque': produto.quantidade_estoque,
    }));

    // Criar workbook e worksheet
    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 8 },  // ID
      { wch: 30 }, // Nome
      { wch: 20 }, // Categoria
      { wch: 20 }, // Fabricante
      { wch: 40 }, // Descrição
      { wch: 15 }, // Prateleira
      { wch: 15 }, // Alocação
      { wch: 20 }, // Quantidade em Estoque
    ];
    worksheet['!cols'] = colWidths;

    // Gerar nome do arquivo com data e hora
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const horaFormatada = dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const nomeArquivo = `estoque-produtos-${dataFormatada}-${horaFormatada}.xlsx`;

    // Fazer download do arquivo
    XLSX.writeFile(workbook, nomeArquivo);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Controle de Estoque
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gerencie produtos e monitore o estoque do almoxarifado
          </p>
        </div>

        {/* Ações */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-4">
            <Link
              href="/estoque/produtos/novo"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Produto
            </Link>
            {produtos.length > 0 && (
              <button
                onClick={exportarParaXLSX}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar para Excel
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <Link
              href="/estoque/recebimentos"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18m-6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Registrar Recebimento
            </Link>
            <Link
              href="/estoque/saidas"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Registrar Saída
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-4">
          <form onSubmit={handleBusca} className="space-y-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Buscar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome, descrição, categoria ou fabricante..."
                  className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Filtros por categoria e fabricante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Filtrar por Categoria
                </label>
                <select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Filtrar por Fabricante
                </label>
                <select
                  value={fabricanteFiltro}
                  onChange={(e) => setFabricanteFiltro(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os fabricantes</option>
                  {fabricantes.map((fab) => (
                    <option key={fab} value={fab}>
                      {fab}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botão limpar filtros */}
            {temFiltrosAtivos && (
              <div>
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="px-6 py-2 bg-zinc-500 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Tabela de Produtos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {temFiltrosAtivos ? 'Nenhum produto encontrado com os filtros aplicados.' : 'Nenhum produto cadastrado.'}
            </p>
            {!temFiltrosAtivos && (
              <Link
                href="/estoque/produtos/novo"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Cadastrar Primeiro Produto
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Fabricante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Prateleira
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Alocação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                      #{produto.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {produto.categoria || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {produto.fabricante || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {produto.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {produto.prateleira || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {produto.alocacao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          produto.quantidade_estoque === 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : produto.quantidade_estoque < 10
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {produto.quantidade_estoque} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/estoque/produtos/${produto.id}/editar`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
