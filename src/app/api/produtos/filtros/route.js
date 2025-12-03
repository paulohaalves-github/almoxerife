import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Obter lista de categorias, fabricantes, prateleiras e alocações únicos
export async function GET() {
  try {
    const [categoriasResult, fabricantesResult, prateleirasResult, alocacoesResult] = await Promise.all([
      query('SELECT DISTINCT categoria FROM produtos WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria ASC'),
      query('SELECT DISTINCT fabricante FROM produtos WHERE fabricante IS NOT NULL AND fabricante != "" ORDER BY fabricante ASC'),
      query('SELECT DISTINCT prateleira FROM produtos WHERE prateleira IS NOT NULL AND prateleira != "" ORDER BY prateleira ASC'),
      query('SELECT DISTINCT alocacao FROM produtos WHERE alocacao IS NOT NULL AND alocacao != "" ORDER BY alocacao ASC')
    ]);

    const categorias = categoriasResult.map(row => row.categoria);
    const fabricantes = fabricantesResult.map(row => row.fabricante);
    const prateleiras = prateleirasResult.map(row => row.prateleira);
    const alocacoes = alocacoesResult.map(row => row.alocacao);

    return NextResponse.json({ categorias, fabricantes, prateleiras, alocacoes }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar filtros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filtros', details: error.message },
      { status: 500 }
    );
  }
}


