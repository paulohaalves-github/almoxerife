import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar sessão' },
      { status: 500 }
    );
  }
}


