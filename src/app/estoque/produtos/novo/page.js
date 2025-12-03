'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SelectWithAdd from '@/components/SelectWithAdd';

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [fabricantes, setFabricantes] = useState([]);
  const [prateleiras, setPrateleiras] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    fabricante: '',
    prateleira: '',
    alocacao: '',
  });

  useEffect(() => {
    carregarOpcoes();
  }, []);

  const carregarOpcoes = async () => {
    try {
      setLoadingOptions(true);
      const response = await fetch('/api/produtos/filtros');
      const data = await response.json();
      
      if (response.ok) {
        setCategorias(data.categorias || []);
        setFabricantes(data.fabricantes || []);
        setPrateleiras(data.prateleiras || []);
        setAlocacoes(data.alocacoes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAddCategoria = (novaCategoria) => {
    if (!categorias.includes(novaCategoria)) {
      setCategorias([...categorias, novaCategoria].sort());
    }
  };

  const handleAddFabricante = (novoFabricante) => {
    if (!fabricantes.includes(novoFabricante)) {
      setFabricantes([...fabricantes, novoFabricante].sort());
    }
  };

  const handleAddPrateleira = (novaPrateleira) => {
    if (!prateleiras.includes(novaPrateleira)) {
      setPrateleiras([...prateleiras, novaPrateleira].sort());
    }
  };

  const handleAddAlocacao = (novaAlocacao) => {
    if (!alocacoes.includes(novaAlocacao)) {
      setAlocacoes([...alocacoes, novaAlocacao].sort());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/estoque');
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto. Tente novamente.');
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Novo Produto
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Cadastre um novo produto no almoxarifado
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Nome do Produto *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Papel A4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectWithAdd
                id="categoria"
                name="categoria"
                label="Categoria"
                value={formData.categoria}
                onChange={handleChange}
                options={categorias}
                placeholder="Selecione ou digite para adicionar"
                onAddNew={handleAddCategoria}
              />

              <SelectWithAdd
                id="fabricante"
                name="fabricante"
                label="Fabricante"
                value={formData.fabricante}
                onChange={handleChange}
                options={fabricantes}
                placeholder="Selecione ou digite para adicionar"
                onAddNew={handleAddFabricante}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectWithAdd
                id="prateleira"
                name="prateleira"
                label="Prateleira"
                value={formData.prateleira}
                onChange={handleChange}
                options={prateleiras}
                placeholder="Selecione ou digite para adicionar"
                onAddNew={handleAddPrateleira}
              />

              <SelectWithAdd
                id="alocacao"
                name="alocacao"
                label="Alocação"
                value={formData.alocacao}
                onChange={handleChange}
                options={alocacoes}
                placeholder="Selecione ou digite para adicionar"
                onAddNew={handleAddAlocacao}
              />
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                value={formData.descricao}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
              >
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </button>
              <Link
                href="/estoque"
                className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
