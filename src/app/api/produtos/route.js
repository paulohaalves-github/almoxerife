import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Listar todos os produtos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = searchParams.get('busca');
    const categoria = searchParams.get('categoria');
    const fabricante = searchParams.get('fabricante');

    let sql = 'SELECT * FROM produtos';
    let params = [];
    const conditions = [];

    if (busca) {
      conditions.push('(nome LIKE ? OR descricao LIKE ? OR categoria LIKE ? OR fabricante LIKE ?)');
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    if (categoria) {
      conditions.push('categoria = ?');
      params.push(categoria);
    }

    if (fabricante) {
      conditions.push('fabricante = ?');
      params.push(fabricante);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY nome ASC';

    const produtos = await query(sql, params);
    
    return NextResponse.json(produtos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo produto
export async function POST(request) {
  try {
    const body = await request.json();
    const { nome, descricao, categoria, fabricante, prateleira, alocacao } = body;

    // Validação
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do produto é obrigatório' },
        { status: 400 }
      );
    }

    const sql = 'INSERT INTO produtos (nome, descricao, categoria, fabricante, prateleira, alocacao, quantidade_estoque) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await query(sql, [
      nome.trim(), 
      descricao || null, 
      categoria || null,
      fabricante || null,
      prateleira || null,
      alocacao || null,
      0
    ]);

    return NextResponse.json(
      { 
        message: 'Produto criado com sucesso',
        id: result.insertId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    
    // Verificar se é erro de duplicação
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Já existe um produto com esse nome' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar produto', details: error.message },
      { status: 500 }
    );
  }
}

