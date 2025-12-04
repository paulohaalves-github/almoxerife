import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// PUT - Atualizar nota fiscal de um recebimento
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const notaFiscalFile = formData.get('nota_fiscal_pdf');

    // Verificar se o recebimento existe
    const recebimentos = await query('SELECT * FROM recebimentos WHERE id = ?', [id]);
    
    if (recebimentos.length === 0) {
      return NextResponse.json(
        { error: 'Recebimento não encontrado' },
        { status: 404 }
      );
    }

    const recebimento = recebimentos[0];

    // Validar se foi enviado um arquivo
    if (!notaFiscalFile || !(notaFiscalFile instanceof File) || notaFiscalFile.size === 0) {
      return NextResponse.json(
        { error: 'Arquivo PDF é obrigatório' },
        { status: 400 }
      );
    }

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

    let notaFiscalPath = null;

    try {
      // Criar diretório se não existir
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'notas-fiscais');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Se já existe uma nota fiscal, deletar o arquivo antigo
      if (recebimento.nota_fiscal_pdf) {
        try {
          const oldFilePath = join(process.cwd(), 'public', recebimento.nota_fiscal_pdf);
          if (existsSync(oldFilePath)) {
            await unlink(oldFilePath);
          }
        } catch (deleteError) {
          console.warn('Erro ao deletar arquivo antigo:', deleteError);
          // Continuar mesmo se não conseguir deletar o arquivo antigo
        }
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

    // Atualizar o recebimento com o caminho da nota fiscal
    await query(
      'UPDATE recebimentos SET nota_fiscal_pdf = ? WHERE id = ?',
      [notaFiscalPath, id]
    );

    return NextResponse.json(
      { 
        message: 'Nota fiscal adicionada com sucesso',
        nota_fiscal_pdf: notaFiscalPath
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar recebimento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar recebimento', details: error.message },
      { status: 500 }
    );
  }
}

