'use client';

import { useState, useEffect, useRef } from 'react';

export default function SelectWithAdd({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Selecione ou digite para adicionar',
  className = '',
  required = false,
  onAddNew = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(opt => 
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      
      // Mostrar opção de adicionar se o termo não existe
      const exists = options.some(opt => 
        opt.toLowerCase() === searchTerm.toLowerCase()
      );
      setShowAddOption(!exists && searchTerm.trim() !== '');
    } else {
      setFilteredOptions(options);
      setShowAddOption(false);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNew = () => {
    if (searchTerm.trim()) {
      const newValue = searchTerm.trim();
      handleSelect(newValue);
      // Notificar o componente pai para atualizar a lista de opções
      if (onAddNew && !options.includes(newValue)) {
        onAddNew(newValue);
      }
    }
  };

  const selectedOption = options.find(opt => opt === value) || value;

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
            {selectedOption || placeholder}
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
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {/* Campo de busca */}
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ou digite para adicionar..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Lista de opções */}
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                      value === option ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                    }`}
                  >
                    {option}
                  </button>
                ))
              ) : (
                !showAddOption && (
                  <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Nenhuma opção encontrada
                  </div>
                )
              )}

              {/* Opção para adicionar novo */}
              {showAddOption && (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 border-t border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-green-600 dark:text-green-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar "{searchTerm}"
                </button>
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

