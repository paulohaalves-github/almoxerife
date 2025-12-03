'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SelectDestinatario from '@/components/SelectDestinatario';
import * as XLSX from 'xlsx';

export default function SaidasPage() {
  const [produtos, setProdutos] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade: '',
    destinatario_id: '',
    observacoes: '',
  });
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    destinatario_id: '',
    setor: '',
  });

  useEffect(() => {
    carregarDados();
    carregarSaidas();
  }, []);

  useEffect(() => {
    carregarSaidas();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [produtosRes, destinatariosRes] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/destinatarios'),
      ]);

      const produtosData = await produtosRes.json();
      const destinatariosData = await destinatariosRes.json();

      if (produtosRes.ok) {
        setProdutos(produtosData);
      }

      if (destinatariosRes.ok) {
        setDestinatarios(destinatariosData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarSaidas = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.data_inicio) {
        params.append('data_inicio', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        params.append('data_fim', filtros.data_fim);
      }
      if (filtros.destinatario_id) {
        params.append('destinatario_id', filtros.destinatario_id);
      }
      if (filtros.setor) {
        params.append('setor', filtros.setor);
      }

      const saidasRes = await fetch(`/api/saidas?${params.toString()}`);
      const saidasData = await saidasRes.json();

      if (saidasRes.ok) {
        setSaidas(saidasData);
      }
    } catch (error) {
      console.error('Erro ao carregar saídas:', error);
    }
  };

  const handleAddDestinatario = async (novoDestinatario) => {
    // Adicionar o novo destinatário à lista
    setDestinatarios((prev) => [...prev, novoDestinatario]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrando(true);

    try {
      const response = await fetch('/api/saidas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantidade: parseInt(formData.quantidade),
          destinatario_id: parseInt(formData.destinatario_id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Saída registrada com sucesso!');
        setFormData({
          produto_id: '',
          quantidade: '',
          destinatario_id: '',
          observacoes: '',
        });
        setShowForm(false);
        carregarDados();
        carregarSaidas();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      alert('Erro ao registrar saída. Tente novamente.');
    } finally {
      setRegistrando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      data_inicio: '',
      data_fim: '',
      destinatario_id: '',
      setor: '',
    });
  };

  const exportarXLSX = () => {
    if (saidas.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    // Preparar dados para exportação
    const dadosExportacao = saidas.map((saida) => ({
      'Data/Hora': new Date(saida.created_at).toLocaleString('pt-BR'),
      'Produto': saida.produto_nome,
      'Quantidade': saida.quantidade,
      'Destinatário': saida.destinatario_nome || saida.destinatario || '-',
      'Setor': saida.destinatario_setor || '-',
      'Observações': saida.observacoes || '-',
    }));

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(dadosExportacao);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Saídas');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 20 }, // Data/Hora
      { wch: 30 }, // Produto
      { wch: 12 }, // Quantidade
      { wch: 25 }, // Destinatário
      { wch: 20 }, // Setor
      { wch: 40 }, // Observações
    ];
    ws['!cols'] = colWidths;

    // Gerar nome do arquivo com data atual
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivo = `saidas_${dataAtual}.xlsx`;

    // Salvar arquivo
    XLSX.writeFile(wb, nomeArquivo);
  };

  const produtoSelecionado = produtos.find((p) => p.id === parseInt(formData.produto_id));
  const quantidadeMax = produtoSelecionado?.quantidade_estoque || 0;

  // Obter setores únicos dos destinatários
  const setoresUnicos = [...new Set(destinatarios.map((d) => d.setor).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/estoque"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Estoque
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Registro de Saídas
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Registre as saídas de produtos do almoxarifado
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancelar' : 'Nova Saída'}
            </button>
          </div>
        </div>

        {/* Formulário de Saída */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
              Registrar Nova Saída
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="produto_id"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Produto *
                  </label>
                  <select
                    id="produto_id"
                    name="produto_id"
                    required
                    value={formData.produto_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos
                      .filter((p) => p.quantidade_estoque > 0)
                      .map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} (Estoque: {produto.quantidade_estoque})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quantidade"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    required
                    min="1"
                    max={quantidadeMax}
                    value={formData.quantidade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quantidade a retirar"
                  />
                  {produtoSelecionado && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Máximo disponível: {quantidadeMax}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <SelectDestinatario
                  id="destinatario_id"
                  name="destinatario_id"
                  label="Destinatário"
                  value={formData.destinatario_id}
                  onChange={handleChange}
                  destinatarios={destinatarios}
                  placeholder="Selecione ou cadastre um destinatário"
                  required
                  onAddNew={handleAddDestinatario}
                />
              </div>

              <div>
                <label
                  htmlFor="observacoes"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  rows={3}
                  value={formData.observacoes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações adicionais sobre a saída..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      produto_id: '',
                      quantidade: '',
                      destinatario_id: '',
                      observacoes: '',
                    });
                  }}
                  className="px-6 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registrando}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                >
                  {registrando ? 'Registrando...' : 'Registrar Saída'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros e Exportação */}
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="data_inicio"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Data Início
                </label>
                <input
                  type="date"
                  id="data_inicio"
                  name="data_inicio"
                  value={filtros.data_inicio}
                  onChange={handleFiltroChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="data_fim"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Data Fim
                </label>
                <input
                  type="date"
                  id="data_fim"
                  name="data_fim"
                  value={filtros.data_fim}
                  onChange={handleFiltroChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="filtro_destinatario_id"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Destinatário
                </label>
                <select
                  id="filtro_destinatario_id"
                  name="destinatario_id"
                  value={filtros.destinatario_id}
                  onChange={handleFiltroChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os destinatários</option>
                  {destinatarios.map((destinatario) => (
                    <option key={destinatario.id} value={destinatario.id}>
                      {destinatario.nome} - {destinatario.setor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filtro_setor"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Setor
                </label>
                <select
                  id="filtro_setor"
                  name="setor"
                  value={filtros.setor}
                  onChange={handleFiltroChange}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os setores</option>
                  {setoresUnicos.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={limparFiltros}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Limpar Filtros
              </button>
              <button
                onClick={exportarXLSX}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar XLSX
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Saídas */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Carregando saídas...</p>
          </div>
        ) : saidas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">Nenhuma saída registrada ainda.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Destinatário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Setor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Observações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {saidas.map((saida) => (
                  <tr key={saida.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(saida.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                      {saida.produto_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                      {saida.quantidade} unidades
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
                      {saida.destinatario_nome || saida.destinatario || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {saida.destinatario_setor || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {saida.observacoes || '-'}
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


