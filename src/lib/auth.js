import { cookies } from 'next/headers';
import { query } from './db';
import bcrypt from 'bcryptjs';

// Verificar se o usuário está autenticado
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    return null;
  }

  try {
    const sessionData = JSON.parse(session.value);
    return sessionData;
  } catch (error) {
    return null;
  }
}

// Verificar credenciais e fazer login
export async function login(usuario, senha) {
  try {
    const usuarios = await query(
      'SELECT * FROM usuarios WHERE usuario = ? AND ativo = TRUE',
      [usuario]
    );

    if (usuarios.length === 0) {
      return { success: false, error: 'Usuário ou senha inválidos' };
    }

    const user = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return { success: false, error: 'Usuário ou senha inválidos' };
    }

    const sessionData = {
      id: user.id,
      usuario: user.usuario,
      perfil: user.perfil,
    };

    return { success: true, user: sessionData };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: 'Erro ao fazer login' };
  }
}

// Fazer logout
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Verificar se o usuário tem permissão para acessar uma rota
export function hasPermission(userPerfil, pathname) {
  if (userPerfil === 'Administrador') {
    return true;
  }

  if (userPerfil === 'Estoque') {
    return pathname.startsWith('/estoque');
  }

  return false;
}

// Verificar se a rota requer autenticação
export function requiresAuth(pathname) {
  // Rotas públicas
  const publicRoutes = ['/login'];
  return !publicRoutes.includes(pathname);
}


