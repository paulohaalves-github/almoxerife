'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

export default function RecebimentosPage() {
  const [produtos, setProdutos] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade: '',
    valor_unitario: '',
  });
  const [notaFiscalFile, setNotaFiscalFile] = useState(null);
  const [uploadingNotaFiscal, setUploadingNotaFiscal] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [produtosRes, recebimentosRes] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/recebimentos'),
      ]);

      const produtosData = await produtosRes.json();
      const recebimentosData = await recebimentosRes.json();

      if (produtosRes.ok) {
        setProdutos(produtosData);
      }

      if (recebimentosRes.ok) {
        setRecebimentos(recebimentosData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const produtoIdNumber = parseInt(formData.produto_id, 10);
    const quantidadeNumber = parseInt(formData.quantidade, 10);
    const valorUnitarioNumber = parseFloat(formData.valor_unitario);

    if (Number.isNaN(produtoIdNumber)) {
      alert('Selecione um produto válido.');
      return;
    }

    if (Number.isNaN(quantidadeNumber) || quantidadeNumber <= 0) {
      alert('Informe uma quantidade válida.');
      return;
    }

    if (Number.isNaN(valorUnitarioNumber) || valorUnitarioNumber <= 0) {
      alert('Informe um valor unitário válido.');
      return;
    }

    setRegistrando(true);

    try {
      // Criar FormData para enviar dados e arquivo
      const formDataToSend = new FormData();
      formDataToSend.append('produto_id', produtoIdNumber);
      formDataToSend.append('quantidade', quantidadeNumber);
      formDataToSend.append('valor_unitario', valorUnitarioNumber);
      
      if (notaFiscalFile) {
        formDataToSend.append('nota_fiscal_pdf', notaFiscalFile);
      }

      const response = await fetch('/api/recebimentos', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Recebimento registrado com sucesso!');
        setFormData({
          produto_id: '',
          quantidade: '',
          valor_unitario: '',
        });
        setNotaFiscalFile(null);
        setShowForm(false);
        carregarDados();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      alert('Erro ao registrar recebimento. Tente novamente.');
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

  const handleUploadNotaFiscal = async (recebimentoId, file) => {
    if (!file) {
      alert('Selecione um arquivo PDF primeiro.');
      return;
    }

    setUploadingNotaFiscal(recebimentoId);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nota_fiscal_pdf', file);

      const response = await fetch(`/api/recebimentos/${recebimentoId}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Nota fiscal adicionada com sucesso!');
        setUploadingNotaFiscal(null);
        carregarDados();
      } else {
        alert(`Erro: ${data.error}`);
        setUploadingNotaFiscal(null);
      }
    } catch (error) {
      console.error('Erro ao fazer upload da nota fiscal:', error);
      alert('Erro ao fazer upload da nota fiscal. Tente novamente.');
      setUploadingNotaFiscal(null);
    }
  };

  const produtoSelecionado = produtos.find(
    (produto) => String(produto.id) === String(formData.produto_id)
  );
  const fornecedorSelecionado =
    produtoSelecionado?.fabricante && produtoSelecionado.fabricante.trim() !== ''
      ? produtoSelecionado.fabricante
      : 'Não informado';
  const quantidadeNumber = parseFloat(formData.quantidade) || 0;
  const valorUnitarioNumber = parseFloat(formData.valor_unitario) || 0;
  const valorTotalCalculado =
    quantidadeNumber > 0 && valorUnitarioNumber > 0
      ? quantidadeNumber * valorUnitarioNumber
      : 0;

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
                Registro de Recebimentos
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Registre os recebimentos de produtos no almoxarifado selecionando o produto e a quantidade
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancelar' : 'Novo Recebimento'}
            </button>
          </div>
        </div>

        {/* Formulário de Recebimento */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
              Registrar Novo Recebimento
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
                    {produtos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} (Estoque atual: {produto.quantidade_estoque})
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
                    value={formData.quantidade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quantidade recebida"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="fornecedor"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    id="fornecedor"
                    value={
                      formData.produto_id
                        ? fornecedorSelecionado
                        : 'Selecione um produto para visualizar'
                    }
                    disabled
                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="valor_unitario"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Valor Unitário (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="valor_unitario"
                    name="valor_unitario"
                    required
                    value={formData.valor_unitario}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 9.90"
                  />
                </div>

                <div>
                  <label
                    htmlFor="valor_total"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Valor Total (R$)
                  </label>
                  <input
                    type="text"
                    id="valor_total"
                    readOnly
                    value={
                      valorTotalCalculado > 0
                        ? currencyFormatter.format(valorTotalCalculado)
                        : ''
                    }
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
                    placeholder="Será calculado automaticamente"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="nota_fiscal_pdf"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Nota Fiscal (PDF) - Opcional
                </label>
                <input
                  type="file"
                  id="nota_fiscal_pdf"
                  name="nota_fiscal_pdf"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Validar tamanho (máximo 10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        alert('O arquivo PDF deve ter no máximo 10MB');
                        e.target.value = '';
                        setNotaFiscalFile(null);
                        return;
                      }
                      // Validar tipo
                      if (file.type !== 'application/pdf') {
                        alert('Apenas arquivos PDF são permitidos');
                        e.target.value = '';
                        setNotaFiscalFile(null);
                        return;
                      }
                      setNotaFiscalFile(file);
                    } else {
                      setNotaFiscalFile(null);
                    }
                  }}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
                {notaFiscalFile && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Arquivo selecionado: {notaFiscalFile.name} ({(notaFiscalFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      produto_id: '',
                      quantidade: '',
                      valor_unitario: '',
                    });
                    setNotaFiscalFile(null);
                  }}
                  className="px-6 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registrando}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {registrando ? 'Registrando...' : 'Registrar Recebimento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Recebimentos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Carregando recebimentos...</p>
          </div>
        ) : recebimentos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">Nenhum recebimento registrado ainda.</p>
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
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Valor Unitário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Nota Fiscal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {recebimentos.map((recebimento) => (
                  <tr key={recebimento.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(recebimento.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                      {recebimento.produto_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                      {recebimento.quantidade} unidades
                    </td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
                    {recebimento.fornecedor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                    {currencyFormatter.format(Number(recebimento.valor_unitario || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                    {currencyFormatter.format(Number(recebimento.valor_total || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {recebimento.nota_fiscal_pdf ? (
                      <a
                        href={recebimento.nota_fiscal_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-500">Não informada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {recebimento.nota_fiscal_pdf ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id={`nota-fiscal-replace-${recebimento.id}`}
                          accept=".pdf,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                alert('O arquivo PDF deve ter no máximo 10MB');
                                e.target.value = '';
                                return;
                              }
                              if (file.type !== 'application/pdf') {
                                alert('Apenas arquivos PDF são permitidos');
                                e.target.value = '';
                                return;
                              }
                              if (confirm('Deseja substituir a nota fiscal atual?')) {
                                handleUploadNotaFiscal(recebimento.id, file);
                              } else {
                                e.target.value = '';
                              }
                            }
                          }}
                          className="hidden"
                          disabled={uploadingNotaFiscal === recebimento.id}
                        />
                        <label
                          htmlFor={`nota-fiscal-replace-${recebimento.id}`}
                          className={`inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                            uploadingNotaFiscal === recebimento.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          {uploadingNotaFiscal === recebimento.id ? 'Enviando...' : 'Substituir'}
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id={`nota-fiscal-${recebimento.id}`}
                          accept=".pdf,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                alert('O arquivo PDF deve ter no máximo 10MB');
                                e.target.value = '';
                                return;
                              }
                              if (file.type !== 'application/pdf') {
                                alert('Apenas arquivos PDF são permitidos');
                                e.target.value = '';
                                return;
                              }
                              handleUploadNotaFiscal(recebimento.id, file);
                            }
                          }}
                          className="hidden"
                          disabled={uploadingNotaFiscal === recebimento.id}
                        />
                        <label
                          htmlFor={`nota-fiscal-${recebimento.id}`}
                          className={`inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                            uploadingNotaFiscal === recebimento.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {uploadingNotaFiscal === recebimento.id ? 'Enviando...' : 'Adicionar PDF'}
                        </label>
                      </div>
                    )}
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

