'use client';

import { useState, useEffect, useRef } from 'react';

export default function SelectDestinatario({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  destinatarios = [], 
  placeholder = 'Selecione ou cadastre um destinatário',
  className = '',
  required = false,
  onAddNew = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoSetor, setNovoSetor] = useState('');
  const [criando, setCriando] = useState(false);
  const [filteredDestinatarios, setFilteredDestinatarios] = useState(destinatarios);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredDestinatarios(destinatarios);
  }, [destinatarios]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = destinatarios.filter(dest => 
        dest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.setor.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDestinatarios(filtered);
    } else {
      setFilteredDestinatarios(destinatarios);
    }
  }, [searchTerm, destinatarios]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setShowAddForm(false);
        setNovoNome('');
        setNovoSetor('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (destinatario) => {
    onChange({ target: { name, value: destinatario.id.toString() } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNew = async () => {
    if (!novoNome.trim() || !novoSetor.trim()) {
      alert('Preencha nome e setor para cadastrar um novo destinatário.');
      return;
    }

    setCriando(true);
    try {
      const response = await fetch('/api/destinatarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: novoNome.trim(),
          setor: novoSetor.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Notificar o componente pai para atualizar a lista
        if (onAddNew) {
          await onAddNew(data.destinatario);
        }
        
        // Selecionar o novo destinatário
        handleSelect(data.destinatario);
        
        setNovoNome('');
        setNovoSetor('');
        setShowAddForm(false);
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar destinatário:', error);
      alert('Erro ao criar destinatário. Tente novamente.');
    } finally {
      setCriando(false);
    }
  };

  const selectedDestinatario = destinatarios.find(d => d.id.toString() === value?.toString());

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
      >
        {label} {required && '*'}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className={`w-full px-4 py-2 text-left border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${className}`}
        >
          <span className={value ? '' : 'text-zinc-500 dark:text-zinc-400'}>
            {selectedDestinatario 
              ? `${selectedDestinatario.nome} - ${selectedDestinatario.setor}`
              : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-zinc-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-96 overflow-auto">
            {/* Campo de busca */}
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar destinatário..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Botão para adicionar novo */}
            {!showAddForm && (
              <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full px-3 py-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2 text-green-600 dark:text-green-400 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Cadastrar Novo Destinatário
                </button>
              </div>
            )}

            {/* Formulário de cadastro */}
            {showAddForm && (
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Nome do destinatário"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="text"
                    value={novoSetor}
                    onChange={(e) => setNovoSetor(e.target.value)}
                    placeholder="Setor"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddNew}
                      disabled={criando || !novoNome.trim() || !novoSetor.trim()}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md text-sm"
                    >
                      {criando ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNovoNome('');
                        setNovoSetor('');
                      }}
                      className="px-3 py-2 bg-zinc-500 hover:bg-zinc-600 text-white rounded-md text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de destinatários */}
            <div className="max-h-48 overflow-auto">
              {filteredDestinatarios.length > 0 ? (
                filteredDestinatarios.map((destinatario) => (
                  <button
                    key={destinatario.id}
                    type="button"
                    onClick={() => handleSelect(destinatario)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                      value === destinatario.id.toString() ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                    }`}
                  >
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {destinatario.nome}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {destinatario.setor}
                    </div>
                  </button>
                ))
              ) : (
                !showAddForm && (
                  <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhum destinatário encontrado
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input hidden para o formulário */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={value || ''}
      />
    </div>
  );
}




