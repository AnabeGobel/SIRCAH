import { NextResponse } from "next/server"
import { auth as adminAuth, db as adminDb } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido ou inválido." }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "").trim()
    const decodedToken = await adminAuth.verifyIdToken(token)
    const currentUid = decodedToken.uid

    const payload = await request.json()
    const targetUid = String(payload?.uid || "").trim()

    if (!targetUid) {
      return NextResponse.json({ error: "UID do utilizador a remover não foi informado." }, { status: 400 })
    }

    if (currentUid === targetUid) {
      return NextResponse.json({ error: "Não pode remover a sua própria conta." }, { status: 400 })
    }

    const profileCollections = ["usuariosWeb", "usuarios", "agentes", "users"]
    let removidoNoFirestore = false

    for (const collectionName of profileCollections) {
      const profileRef = adminDb.collection(collectionName).doc(targetUid)
      const profileSnapshot = await profileRef.get()

      if (profileSnapshot.exists) {
        await profileRef.delete()
        removidoNoFirestore = true
      }
    }

    let removidoNoAuth = false
    try {
      await adminAuth.deleteUser(targetUid)
      removidoNoAuth = true
    } catch (authError: any) {
      if (authError?.code !== "auth/user-not-found") {
        console.error("Erro ao remover utilizador do Firebase Auth:", authError)
      }
    }

    if (!removidoNoFirestore && !removidoNoAuth) {
      return NextResponse.json({ error: "Utilizador não encontrado no sistema." }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: removidoNoAuth
        ? "Utilizador removido com sucesso."
        : "Utilizador removido do sistema, mas a conta de autenticação já não existia.",
    })
  } catch (error: any) {
    console.error("Erro ao remover utilizador:", error)
    return NextResponse.json({ error: error?.message || "Erro ao remover utilizador." }, { status: 500 })
  }
}
