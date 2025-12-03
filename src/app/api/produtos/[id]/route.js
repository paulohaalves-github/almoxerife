import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Buscar produto por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    const sql = 'SELECT * FROM produtos WHERE id = ?';
    const produtos = await query(sql, [id]);

    if (produtos.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(produtos[0], { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar produto
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nome, descricao, categoria, fabricante, prateleira, alocacao } = body;

    // Validação
    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do produto é obrigatório' },
        { status: 400 }
      );
    }

    // NÃO permitir atualizar quantidade_estoque via edição
    // A quantidade só muda via saídas registradas
    const sql = `
      UPDATE produtos 
      SET nome = ?, descricao = ?, categoria = ?, fabricante = ?, prateleira = ?, alocacao = ?
      WHERE id = ?
    `;
    
    const result = await query(sql, [
      nome.trim(),
      descricao || null,
      categoria || null,
      fabricante || null,
      prateleira || null,
      alocacao || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Produto atualizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Deletar produto
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se há saídas relacionadas
    const saidasCheck = await query('SELECT COUNT(*) as count FROM saidas WHERE produto_id = ?', [id]);
    
    if (saidasCheck[0].count > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar produto com saídas registradas' },
        { status: 400 }
      );
    }

    const sql = 'DELETE FROM produtos WHERE id = ?';
    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Produto deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar produto', details: error.message },
      { status: 500 }
    );
  }
}

