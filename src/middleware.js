import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rotas públicas
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Verificar autenticação
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    // Redirecionar para login se não autenticado
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const sessionData = JSON.parse(session.value);
    const userPerfil = sessionData.perfil;

    // Verificar permissões
    if (userPerfil === 'Estoque') {
      // Usuário Estoque só pode acessar rotas /estoque
      if (!pathname.startsWith('/estoque')) {
        const url = request.nextUrl.clone();
        url.pathname = '/estoque';
        return NextResponse.redirect(url);
      }
    }

    // Administrador pode acessar tudo
    return NextResponse.next();
  } catch (error) {
    // Sessão inválida, redirecionar para login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};

