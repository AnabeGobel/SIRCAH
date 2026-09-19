import { db } from '@/lib/Services/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  DocumentData
} from "firebase/firestore";
import { generateUniqueCode } from './generateCode';
import QRCode from 'qrcode';

export interface ResidencialDoc extends DocumentData {
  id: string;
  bairro?: string;
  status?: string;
  estadoResidencia?: "valido" | "invalido";
  codigo?: string;
  qr_code_url?: string;
  motivoRejeicao?: string;
  mensagemEstado?: string;
  justificativaReenvio?: string;
  editadoEm?: unknown;
}

const obterCampoJustificativa = (dados: Record<string, any>, campo: string) => {
  const fontes = [
    dados,
    dados.justificativa,
    dados.justificacao,
    dados.reenvio,
    dados.justificativaReenvio,
    dados.dadosJustificativa,
  ]

  return fontes.find((fonte) => fonte && typeof fonte === "object" && fonte[campo])?.[campo] || ""
}

export const obterJustificativaReenvio = (dados: Record<string, any>) =>
  obterCampoJustificativa(dados, "comentarioJustificativa") || dados.justificativaReenvio || dados.justificativaTexto || dados.mensagemReenvio || dados.justificativaEdicao || (typeof dados.justificativa === "string" ? dados.justificativa : "") || "";

export const obterAnexoJustificacao = (dados: Record<string, any>) =>
  obterCampoJustificativa(dados, "comprovativoUrl") || dados.comprovativoUrl || dados.anexoJustificacao || dados.documentoJustificacao || dados.imagemJustificacao || dados.justificativaArquivo || dados.comprovativoReenvio || "";

export const obterNomeComprovativo = (dados: Record<string, any>) =>
  obterCampoJustificativa(dados, "comprovativoNome") || dados.comprovativoNome || "";

// ─────────────────────────────────────────────
// Buscar residências pelo status
// ─────────────────────────────────────────────
export const buscarResidencias = async (status?: string): Promise<ResidencialDoc[]> => {
  try {
    const residenciasRef = collection(db, "residencias");
    const q = status ? query(residenciasRef, where("status", "==", status)) : query(residenciasRef);

    const snap = await getDocs(q);
    
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as ResidencialDoc[];

  } catch (error) {
    console.error("Erro ao buscar residências:", error);
    throw error;
  }
};

export const buscarResidenciasPendentes = () => buscarResidencias("pendente");

// ─────────────────────────────────────────────
// Aprovar residência
// ─────────────────────────────────────────────
export const aprovarResidencia = async (residenciaId: string) => {
  try {
    const docRef = doc(db, "residencias", residenciaId);

    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error(`Residência ${residenciaId} não encontrada.`);
    }

    const dados = snap.data();
    const bairro: string = dados?.bairro || "RES";

    // Gera o código com base no bairro do Huambo
    const novoCodigo = (generateUniqueCode as any)(bairro);

    // Gera o QR Code dinâmico em Base64
    const urlParaScan = `https://sircah-huambo.ao/verificar/${novoCodigo}`;
    const qrCodeDataUrl: string = await QRCode.toDataURL(urlParaScan, {
      margin: 2,
      width: 300,
    });

    // Atualiza o documento no Firestore
    await updateDoc(docRef, {
      status: "aprovado",
      codigo: novoCodigo,
      qr_code_url: qrCodeDataUrl,
      aprovadoEm: serverTimestamp(),
    });

    return { 
      sucesso: true, 
      novoCodigo, 
      qrCodeDataUrl 
    };

  } catch (error) {
    console.error("Erro ao aprovar residência:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// Rejeitar residência
// ─────────────────────────────────────────────
export const rejeitarResidencia = async (
  residenciaId: string,
  motivo: string
) => {
  try {
    const motivoNormalizado = motivo.trim();
    if (!motivoNormalizado) {
      throw new Error("O motivo da rejeição é obrigatório.");
    }

    const docRef = doc(db, "residencias", residenciaId);
    
    await updateDoc(docRef, {
      status: "rejeitada",
      motivoRejeicao: motivoNormalizado,
      rejeitadoEm: serverTimestamp(),
    });
    
    return { sucesso: true };
  } catch (error) {
    console.error("Erro ao rejeitar residência:", error);
    throw error;
  }
};

export const alterarEstadoResidencia = async (
  residenciaId: string,
  estado: "valido" | "invalido",
  mensagem: string
) => {
  const mensagemNormalizada = mensagem.trim();
  if (!mensagemNormalizada) {
    throw new Error("A mensagem da alteração é obrigatória.");
  }

  const docRef = doc(db, "residencias", residenciaId);
  await updateDoc(docRef, {
    estadoResidencia: estado,
    mensagemEstado: mensagemNormalizada,
    estadoAlteradoEm: serverTimestamp(),
    historicoEstado: {
      estado,
      mensagem: mensagemNormalizada,
      alteradoEm: serverTimestamp(),
    },
  });

  return { sucesso: true, estado, mensagem: mensagemNormalizada };
};
