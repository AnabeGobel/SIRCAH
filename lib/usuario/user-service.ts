// Importamos o "db", o "auth" e o "app" principal configurados
import { db, auth, app } from "@/lib/Services/firebaseConfig"; 
import { 
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export const cadastrarUsuarioWeb = async (dados: any) => {
  const emailOriginal = dados.email.trim().toLowerCase();
  const funcaoLimpa = String(dados.funcao ?? "").trim().toLowerCase();
  let uid = "";
  let secondaryApp = null;
  let usuarioJaExisteNoSistema = false;

  try {
    // Procurar apenas utilizadores do ecossistema operacional.
    const colecoesParaBuscar = ["usuarios", "agentes"]; 

    for (const nomeColecao of colecoesParaBuscar) {
      const colecaoRef = collection(db, nomeColecao);
      const q = query(colecaoRef, where("email", "==", emailOriginal));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Encontrou o utilizador nesta coleção! Captura o UID e interrompe a busca
        const docEncontrado = querySnapshot.docs[0];
        uid = docEncontrado.data().uid || docEncontrado.id;
        usuarioJaExisteNoSistema = true;
        break; 
      }
    }

    // 2. SE NÃO EXISTIR EM NENHUMA COLECÇÃO: Criamos a conta do zero no Auth
    if (!usuarioJaExisteNoSistema) {
      const appOptions = app.options; 
      const appName = `SecondaryApp_${Date.now()}`;
      
      secondaryApp = initializeApp(appOptions, appName);
      const secondaryAuth = getAuth(secondaryApp);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth, 
          emailOriginal, 
          dados.senha
        );
        uid = userCredential.user.uid;

        // Importante: não manter a conta recém-criada como utilizador activo
        // no Auth da app secundária; isto evita que a sessão do administrador
        // seja trocada para a conta criada durante o cadastro.
        if (secondaryAuth.currentUser) {
          await secondaryAuth.signOut();
        }
      } catch (authError: any) {
        if (authError.code === "auth/email-already-in-use") {
          throw new Error("Este e-mail já existe na Autenticação, mas não foi encontrado em nenhuma das coleções mapeadas do Firestore.");
        }
        throw authError;
      } finally {
        await deleteApp(secondaryApp);
      }
    }

    await setDoc(doc(db, "usuariosWeb", uid), {
      uid: uid,
      nome: dados.nome,
      email: emailOriginal,
      telefone: dados.telefone,
      funcao: funcaoLimpa,
      estado: "ativo",
      atualizadoEm: serverTimestamp(),
      ...(!usuarioJaExisteNoSistema && { criadoEm: serverTimestamp() })
    }, { merge: true });

    return { 
      sucesso: true,
      mensagem: usuarioJaExisteNoSistema 
        ? "Conta mobile detetada! O utilizador foi associado ao Painel Web mantendo a senha atual." 
        : "Novo administrador criado com sucesso!"
    };

  } catch (error: any) {
    if (secondaryApp) {
      await deleteApp(secondaryApp);
    }
    console.error("Erro real no cadastro:", error);
    throw new Error(error.message || "Erro ao processar o cadastro.");
  }
};