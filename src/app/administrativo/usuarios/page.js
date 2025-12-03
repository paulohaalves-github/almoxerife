'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    usuario: '',
    senha: '',
    perfil: 'Estoque',
    ativo: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios');
      
      if (response.status === 403) {
        router.push('/estoque');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let response;
      if (editingId) {
        // Atualizar
        const updateData = { ...formData };
        if (!updateData.senha) {
          delete updateData.senha;
        }
        response = await fetch(`/api/usuarios/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      } else {
        // Criar
        response = await fetch('/api/usuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({
          usuario: '',
          senha: '',
          perfil: 'Estoque',
          ativo: true,
        });
        carregarUsuarios();
      } else {
        setError(data.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setError('Erro ao salvar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingId(usuario.id);
    setFormData({
      usuario: usuario.usuario,
      senha: '',
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        carregarUsuarios();
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir usuário');
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const cancelarForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      usuario: '',
      senha: '',
      perfil: 'Estoque',
      ativo: true,
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Gestão de Usuários
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Gerencie os usuários do sistema
              </p>
            </div>
            <button
              onClick={() => {
                cancelarForm();
                setShowForm(!showForm);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancelar' : 'Novo Usuário'}
            </button>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
              {editingId ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="usuario"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Usuário *
                  </label>
                  <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    required
                    value={formData.usuario}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do usuário"
                  />
                </div>

                <div>
                  <label
                    htmlFor="senha"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Senha {editingId ? '(deixe em branco para manter)' : '*'}
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    required={!editingId}
                    value={formData.senha}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senha do usuário"
                  />
                </div>

                <div>
                  <label
                    htmlFor="perfil"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Perfil *
                  </label>
                  <select
                    id="perfil"
                    name="perfil"
                    required
                    value={formData.perfil}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Estoque">Estoque</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    name="ativo"
                    checked={formData.ativo}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="ativo"
                    className="ml-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Usuário ativo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={cancelarForm}
                  className="px-6 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Usuários */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Carregando usuários...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                      {usuario.usuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.perfil === 'Administrador'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {usuario.perfil}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.ativo
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Excluir
                        </button>
                      </div>
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


