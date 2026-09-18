// lib/auth-middleware.ts
import { auth, db } from './firebase-admin';

export async function validarAcesso(req: Request, rolesPermitidos: string[]) {
  try {
    // 1. Extrair o Token do Header de Autorização (Bearer TOKEN)
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { autorizado: false, error: 'Token não fornecido ou inválido' };
    }

    const token = authHeader.split('Bearer ')[1];

    // 2. Verificar se o Token do Firebase é legítimo
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 3. Buscar o perfil do usuário no Firestore para verificar o ROLE
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return { autorizado: false, error: 'Usuário não encontrado no banco de dados' };
    }

    const userData = userDoc.data();
    const userRole = userData?.role; // 'morador', 'agente' ou 'admin'

    // 4. Verificar se o Role do usuário está na lista de permissões da rota
    if (!rolesPermitidos.includes(userRole)) {
      return { 
        autorizado: false, 
        error: `Acesso negado: Seu nível (${userRole}) não permite esta ação.` 
      };
    }

    // Se tudo estiver OK, retorna os dados do usuário para a API usar
    return { 
      autorizado: true, 
      uid, 
      role: userRole,
      userData 
    };

  } catch (error: any) {
    console.error("Erro na validação de acesso:", error.message);
    return { autorizado: false, error: 'Falha na autenticação' };
  }
}