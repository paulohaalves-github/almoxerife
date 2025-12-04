import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Listar todos os destinatários
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM destinatarios WHERE 1=1';
    let params = [];

    if (search) {
      sql += ' AND (nome LIKE ? OR setor LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY nome ASC, setor ASC';

    const destinatarios = await query(sql, params);
    
    return NextResponse.json(destinatarios, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar destinatários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar destinatários', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo destinatário
export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, setor } = body;

    // Validação
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do destinatário é obrigatório' },
        { status: 400 }
      );
    }

    if (!setor || setor.trim() === '') {
      return NextResponse.json(
        { error: 'Setor é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe destinatário com mesmo nome e setor
    const existente = await query(
      'SELECT * FROM destinatarios WHERE nome = ? AND setor = ?',
      [nome.trim(), setor.trim()]
    );

    if (existente.length > 0) {
      return NextResponse.json(
        { 
          message: 'Destinatário já existe',
          id: existente[0].id,
          destinatario: existente[0]
        },
        { status: 200 }
      );
    }

    // Criar novo destinatário
    const sql = 'INSERT INTO destinatarios (nome, setor) VALUES (?, ?)';
    const result = await query(sql, [nome.trim(), setor.trim()]);

    // Buscar o destinatário criado
    const novoDestinatario = await query('SELECT * FROM destinatarios WHERE id = ?', [result.insertId]);

    return NextResponse.json(
      { 
        message: 'Destinatário criado com sucesso',
        id: result.insertId,
        destinatario: novoDestinatario[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar destinatário:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Destinatário com este nome e setor já existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar destinatário', details: error.message },
      { status: 500 }
    );
  }
}



