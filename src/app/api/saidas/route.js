import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Listar todas as saídas
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const produtoId = searchParams.get('produto_id');
    const destinatarioId = searchParams.get('destinatario_id');
    const setor = searchParams.get('setor');
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    let sql = `
      SELECT 
        s.*,
        p.nome as produto_nome,
        p.descricao as produto_descricao,
        d.nome as destinatario_nome,
        d.setor as destinatario_setor
      FROM saidas s
      INNER JOIN produtos p ON s.produto_id = p.id
      LEFT JOIN destinatarios d ON s.destinatario_id = d.id
      WHERE 1=1
    `;
    let params = [];

    if (produtoId) {
      sql += ' AND s.produto_id = ?';
      params.push(produtoId);
    }

    if (destinatarioId) {
      sql += ' AND s.destinatario_id = ?';
      params.push(destinatarioId);
    }

    if (setor) {
      sql += ' AND d.setor LIKE ?';
      params.push(`%${setor}%`);
    }

    if (dataInicio) {
      sql += ' AND DATE(s.created_at) >= ?';
      params.push(dataInicio);
    }

    if (dataFim) {
      sql += ' AND DATE(s.created_at) <= ?';
      params.push(dataFim);
    }

    sql += ' ORDER BY s.created_at DESC';

    const saidas = await query(sql, params);
    
    return NextResponse.json(saidas, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar saídas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar saídas', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Registrar nova saída
export async function POST(request) {
  try {
    const body = await request.json();
    const { produto_id, quantidade, destinatario_id, observacoes } = body;

    // Validação
    if (!produto_id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (!destinatario_id) {
      return NextResponse.json(
        { error: 'Destinatário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o destinatário existe
    const destinatario = await query('SELECT * FROM destinatarios WHERE id = ?', [destinatario_id]);
    
    if (destinatario.length === 0) {
      return NextResponse.json(
        { error: 'Destinatário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o produto existe e tem estoque suficiente
    const produto = await query('SELECT * FROM produtos WHERE id = ?', [produto_id]);
    
    if (produto.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    if (produto[0].quantidade_estoque < quantidade) {
      return NextResponse.json(
        { error: 'Quantidade insuficiente em estoque' },
        { status: 400 }
      );
    }

    // Iniciar transação (simulado com queries sequenciais)
    try {
      // Registrar a saída
      const sql = 'INSERT INTO saidas (produto_id, quantidade, destinatario_id, observacoes) VALUES (?, ?, ?, ?)';
      const result = await query(sql, [
        produto_id,
        quantidade,
        destinatario_id,
        observacoes || null
      ]);

      // Atualizar estoque
      await query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
        [quantidade, produto_id]
      );

      return NextResponse.json(
        { 
          message: 'Saída registrada com sucesso',
          id: result.insertId 
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar saída', details: error.message },
      { status: 500 }
    );
  }
}

