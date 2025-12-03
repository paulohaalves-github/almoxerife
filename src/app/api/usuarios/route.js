import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Listar todos os usuários
export async function GET() {
  try {
    // Verificar se o usuário é administrador
    const session = await getSession();
    if (!session || session.perfil !== 'Administrador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const usuarios = await query(
      'SELECT id, usuario, perfil, ativo, created_at, updated_at FROM usuarios ORDER BY usuario ASC'
    );

    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request) {
  try {
    // Verificar se o usuário é administrador
    const session = await getSession();
    if (!session || session.perfil !== 'Administrador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { usuario, senha, perfil } = body;

    // Validação
    if (!usuario || !senha || !perfil) {
      return NextResponse.json(
        { error: 'Usuário, senha e perfil são obrigatórios' },
        { status: 400 }
      );
    }

    if (perfil !== 'Administrador' && perfil !== 'Estoque') {
      return NextResponse.json(
        { error: 'Perfil inválido. Use "Administrador" ou "Estoque"' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existing = await query(
      'SELECT * FROM usuarios WHERE usuario = ?',
      [usuario]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const result = await query(
      'INSERT INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)',
      [usuario, senhaHash, perfil]
    );

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error.message },
      { status: 500 }
    );
  }
}


