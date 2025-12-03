import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Buscar usuário por ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.perfil !== 'Administrador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;
    const usuarios = await query(
      'SELECT id, usuario, perfil, ativo, created_at, updated_at FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuarios[0], { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.perfil !== 'Administrador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { usuario, senha, perfil, ativo } = body;

    // Verificar se o usuário existe
    const existing = await query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Validação
    if (perfil && perfil !== 'Administrador' && perfil !== 'Estoque') {
      return NextResponse.json(
        { error: 'Perfil inválido. Use "Administrador" ou "Estoque"' },
        { status: 400 }
      );
    }

    // Verificar se o nome de usuário já existe (se estiver sendo alterado)
    if (usuario && usuario !== existing[0].usuario) {
      const usuarioExistente = await query(
        'SELECT * FROM usuarios WHERE usuario = ? AND id != ?',
        [usuario, id]
      );
      if (usuarioExistente.length > 0) {
        return NextResponse.json(
          { error: 'Usuário já existe' },
          { status: 400 }
        );
      }
    }

    // Atualizar campos
    const updates = [];
    const params_update = [];

    if (usuario !== undefined) {
      updates.push('usuario = ?');
      params_update.push(usuario);
    }

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push('senha = ?');
      params_update.push(senhaHash);
    }

    if (perfil !== undefined) {
      updates.push('perfil = ?');
      params_update.push(perfil);
    }

    if (ativo !== undefined) {
      updates.push('ativo = ?');
      params_update.push(ativo);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    params_update.push(id);

    await query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      params_update
    );

    return NextResponse.json(
      { message: 'Usuário atualizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.perfil !== 'Administrador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Não permitir excluir o próprio usuário
    if (parseInt(id) === session.id) {
      return NextResponse.json(
        { error: 'Não é possível excluir seu próprio usuário' },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const existing = await query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    await query('DELETE FROM usuarios WHERE id = ?', [id]);

    return NextResponse.json(
      { message: 'Usuário excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir usuário', details: error.message },
      { status: 500 }
    );
  }
}


