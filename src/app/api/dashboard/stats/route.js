import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// GET - Buscar estatísticas do dashboard
export async function GET(request) {
  try {
    // Verificar se o usuário é administrador
    const session = await getSession();
    if (!session || session.perfil !== 'Administrador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }
    // 1. Recebimentos por categoria (valor e quantidade)
    const recebimentosPorCategoria = await query(`
      SELECT 
        COALESCE(p.categoria, 'Sem categoria') as categoria,
        SUM(r.valor_total) as valor_total,
        SUM(r.quantidade) as quantidade_total,
        COUNT(r.id) as total_recebimentos
      FROM recebimentos r
      INNER JOIN produtos p ON r.produto_id = p.id
      GROUP BY p.categoria
      ORDER BY valor_total DESC
    `);

    // 2. Saídas por destinatário (quantidade)
    const saidasPorDestinatario = await query(`
      SELECT 
        d.nome as destinatario,
        SUM(s.quantidade) as quantidade_total,
        COUNT(s.id) as total_saidas
      FROM saidas s
      INNER JOIN destinatarios d ON s.destinatario_id = d.id
      GROUP BY d.id, d.nome
      ORDER BY quantidade_total DESC
      LIMIT 10
    `);

    // 3. Saídas por setor (quantidade)
    const saidasPorSetor = await query(`
      SELECT 
        COALESCE(d.setor, 'Não informado') as setor,
        SUM(s.quantidade) as quantidade_total,
        COUNT(s.id) as total_saidas
      FROM saidas s
      LEFT JOIN destinatarios d ON s.destinatario_id = d.id
      GROUP BY d.setor
      ORDER BY quantidade_total DESC
    `);

    // 4. Saídas por produto (quantidade)
    const saidasPorProduto = await query(`
      SELECT 
        p.nome as produto,
        SUM(s.quantidade) as quantidade_total,
        COUNT(s.id) as total_saidas
      FROM saidas s
      INNER JOIN produtos p ON s.produto_id = p.id
      GROUP BY p.id, p.nome
      ORDER BY quantidade_total DESC
      LIMIT 10
    `);

    // 5. Produtos com estoque baixo (menos de 5 unidades)
    const produtosEstoqueBaixo = await query(`
      SELECT 
        id,
        nome,
        categoria,
        fabricante,
        quantidade_estoque
      FROM produtos
      WHERE quantidade_estoque < 5
      ORDER BY quantidade_estoque ASC
    `);

    return NextResponse.json({
      recebimentosPorCategoria,
      saidasPorDestinatario,
      saidasPorSetor,
      saidasPorProduto,
      produtosEstoqueBaixo,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do dashboard', details: error.message },
      { status: 500 }
    );
  }
}
