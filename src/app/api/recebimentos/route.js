import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Listar todos os recebimentos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const produtoId = searchParams.get('produto_id');

    let sql = `
      SELECT 
        r.*,
        p.nome as produto_nome,
        p.descricao as produto_descricao,
        p.fabricante as produto_fabricante
      FROM recebimentos r
      INNER JOIN produtos p ON r.produto_id = p.id
      WHERE 1=1
    `;
    let params = [];

    if (produtoId) {
      sql += ' AND r.produto_id = ?';
      params.push(produtoId);
    }

    sql += ' ORDER BY r.created_at DESC';

    const recebimentos = await query(sql, params);
    
    return NextResponse.json(recebimentos, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar recebimentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar recebimentos', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Registrar novo recebimento
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const produto_id = formData.get('produto_id');
    const quantidade = formData.get('quantidade');
    const valor_unitario = formData.get('valor_unitario');
    const notaFiscalFile = formData.get('nota_fiscal_pdf');

    // Validação
    if (!produto_id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    const quantidadeNumber = parseInt(quantidade, 10);
    if (!quantidadeNumber || quantidadeNumber <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    const valorUnitarioNumber = Number(valor_unitario);

    if (Number.isNaN(valorUnitarioNumber) || valorUnitarioNumber <= 0) {
      return NextResponse.json(
        { error: 'Valor unitário deve ser maior que zero' },
        { status: 400 }
      );
    }

    const valorTotalCalculado = quantidadeNumber * valorUnitarioNumber;

    // Verificar se o produto existe
    const produto = await query('SELECT * FROM produtos WHERE id = ?', [produto_id]);
    
    if (produto.length === 0) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Processar upload do PDF da nota fiscal (se fornecido)
    let notaFiscalPath = null;
    if (notaFiscalFile && notaFiscalFile instanceof File && notaFiscalFile.size > 0) {
      // Validar tipo de arquivo
      if (notaFiscalFile.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Apenas arquivos PDF são permitidos' },
          { status: 400 }
        );
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (notaFiscalFile.size > maxSize) {
        return NextResponse.json(
          { error: 'O arquivo PDF deve ter no máximo 10MB' },
          { status: 400 }
        );
      }

      try {
        // Criar diretório se não existir
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'notas-fiscais');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const fileName = `nota-fiscal-${timestamp}-${randomStr}.pdf`;
        const filePath = join(uploadsDir, fileName);

        // Converter File para Buffer e salvar
        const bytes = await notaFiscalFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Armazenar caminho relativo para acesso via URL
        notaFiscalPath = `/uploads/notas-fiscais/${fileName}`;
      } catch (fileError) {
        console.error('Erro ao salvar arquivo PDF:', fileError);
        return NextResponse.json(
          { error: 'Erro ao salvar arquivo PDF', details: fileError.message },
          { status: 500 }
        );
      }
    }

    // Iniciar transação (simulado com queries sequenciais)
    try {
      const fornecedor =
        produto[0].fabricante && produto[0].fabricante.trim() !== ''
          ? produto[0].fabricante
          : 'Não informado';

      const sql = 'INSERT INTO recebimentos (produto_id, quantidade, valor_unitario, valor_total, fornecedor, observacoes, nota_fiscal_pdf) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const result = await query(sql, [
        produto_id,
        quantidadeNumber,
        valorUnitarioNumber,
        valorTotalCalculado,
        fornecedor,
        null,
        notaFiscalPath
      ]);

      // Atualizar estoque (incrementa a quantidade)
      await query(
        'UPDATE produtos SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
        [quantidadeNumber, produto_id]
      );

      return NextResponse.json(
        { 
          message: 'Recebimento registrado com sucesso',
          id: result.insertId 
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao registrar recebimento:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar recebimento', details: error.message },
      { status: 500 }
    );
  }
}

