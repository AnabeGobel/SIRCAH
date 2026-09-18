import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. O React Native envia o UID (do Firebase Auth), o Nome e o Telefone
    const { uid, nome, telefone } = await req.json();

    // Validação básica: garantir que os dados chegaram
    if (!uid || !nome || !telefone) {
      return NextResponse.json(
        { error: "Faltam dados obrigatórios (uid, nome ou telefone)." },
        { status: 400 }
      );
    }

    // 2. Criar ou Atualizar o documento do Morador no Firestore
    // Usamos a coleção 'users' para centralizar todos os tipos de usuários
    await db.collection('users').doc(uid).set({
      uid: uid,
      nome: nome,
      telefone: telefone,
      role: 'morador', // <--- AQUI definimos a AUTORIZAÇÃO
      status: 'ativo',
      createdAt: new Date().toISOString(),
    }, { merge: true }); // O merge evita apagar dados se o usuário já existir

    console.log(`✅ Morador ${nome} registrado com sucesso!`);

    return NextResponse.json({ 
      message: "Perfil de morador criado com sucesso!",
      success: true 
    }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Erro na API de registro:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar o morador." },
      { status: 500 }
    );
  }
}