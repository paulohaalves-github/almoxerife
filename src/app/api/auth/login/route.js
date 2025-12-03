import { NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { usuario, senha } = body;

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await login(usuario, senha);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Criar sessão
    const cookieStore = await cookies();
    // Verificar se está em localhost ou HTTP
    const url = new URL(request.url);
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isHttps = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
    
    // Usar secure apenas se estiver em HTTPS e não for localhost
    const useSecure = !isLocalhost && isHttps;
    
    cookieStore.set('session', JSON.stringify(result.user), {
      httpOnly: true,
      secure: useSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return NextResponse.json(
      { message: 'Login realizado com sucesso', user: result.user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Erro ao fazer login', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}


