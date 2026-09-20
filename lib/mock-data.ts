import type { Residence } from "@/components/residences-table"

export const mockResidences: Residence[] = [
  {
    id: "RES-1021",
    endereco: "Bairro Académico, Rua 15, Casa 23",
    proprietario: "Maria Fernandes",
    bairro: "Académico",
    rua: "Rua 15",
    contacto: "+244 923 456 789",
    criadoEm: "10/03/2026",
    status: "pendente",
    coordenadas: { lat: -12.7636, lng: 15.7372 },
    foto_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1020",
    endereco: "Bairro da Tchianga, Rua 8, Casa 45",
    proprietario: "João Domingos",
    bairro: "Tchianga",
    rua: "Rua 8",
    contacto: "+244 912 345 678",
    criadoEm: "09/03/2026",
    status: "pendente",
    coordenadas: { lat: -12.7580, lng: 15.7420 },
    foto_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1019",
    endereco: "Bairro Lossambo, Rua 3, Casa 12",
    proprietario: "Ana Gabriela",
    bairro: "Lossambo",
    rua: "Rua 3",
    contacto: "+244 934 567 890",
    criadoEm: "08/03/2026",
    status: "aprovado",
    coordenadas: { lat: -12.7700, lng: 15.7300 },
    foto_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1018",
    endereco: "Bairro São José, Rua 22, Casa 8",
    proprietario: "Pedro Manuel",
    bairro: "São José",
    rua: "Rua 22",
    contacto: "+244 945 678 901",
    criadoEm: "07/03/2026",
    status: "aprovado",
    coordenadas: { lat: -12.7550, lng: 15.7500 },
    foto_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1017",
    endereco: "Bairro Benfica, Rua 5, Casa 67",
    proprietario: "Sofia Mateus",
    bairro: "Benfica",
    rua: "Rua 5",
    contacto: "+244 956 789 012",
    criadoEm: "06/03/2026",
    status: "rejeitada",
    coordenadas: { lat: -12.7800, lng: 15.7250 },
    foto_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1016",
    endereco: "Bairro Comercial, Av. Norton de Matos, 89",
    proprietario: "Carlos Alberto",
    bairro: "Comercial",
    rua: "Avenida Norton de Matos",
    contacto: "+244 967 890 123",
    criadoEm: "05/03/2026",
    status: "pendente",
    coordenadas: { lat: -12.7620, lng: 15.7380 },
    foto_url: "https://images.unsplash.com/photo-1600573472591-ee6c8e695f4d?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1015",
    endereco: "Bairro da Calombua, Rua 10, Casa 34",
    proprietario: "Rita Josefa",
    bairro: "Calombua",
    rua: "Rua 10",
    contacto: "+244 978 901 234",
    criadoEm: "04/03/2026",
    status: "aprovado",
    coordenadas: { lat: -12.7680, lng: 15.7450 },
    foto_url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
  },
  {
    id: "RES-1014",
    endereco: "Bairro São Paulo, Rua 18, Casa 56",
    proprietario: "Miguel José",
    bairro: "São Paulo",
    rua: "Rua 18",
    contacto: "+244 989 012 345",
    criadoEm: "03/03/2026",
    status: "pendente",
    coordenadas: { lat: -12.7750, lng: 15.7350 },
    foto_url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop",
  },
]

export type User = {
  id: string
  nome: string
  email: string
  telefone: string
  funcao: "administrador" | "agente" | "visualizador"
  estado: "ativo" | "inativo"
  ultimoAcesso: string
  avatar?: string
}

export const mockUsers: User[] = [
  {
    id: "1",
    nome: "António Manuel",
    email: "antonio.manuel@gestres.ao",
    telefone: "+244 923 111 222",
    funcao: "administrador",
    estado: "ativo",
    ultimoAcesso: "13/03/2026 14:30",
  },
  {
    id: "2",
    nome: "Joana Ferreira",
    email: "joana.ferreira@gestres.ao",
    telefone: "+244 912 333 444",
    funcao: "agente",
    estado: "ativo",
    ultimoAcesso: "13/03/2026 10:15",
  },
  {
    id: "3",
    nome: "Pedro Santos",
    email: "pedro.santos@gestres.ao",
    telefone: "+244 934 555 666",
    funcao: "agente",
    estado: "ativo",
    ultimoAcesso: "12/03/2026 16:45",
  },
  {
    id: "4",
    nome: "Maria Conceição",
    email: "maria.conceicao@gestres.ao",
    telefone: "+244 945 777 888",
    funcao: "visualizador",
    estado: "inativo",
    ultimoAcesso: "01/03/2026 09:00",
  },
]

export function getResidencesByStatus(status: "pendente" | "aprovado" | "rejeitada") {
  return mockResidences.filter((r) => r.status === status)
}

export function getStats() {
  return {
    total: mockResidences.length,
    pendentes: mockResidences.filter((r) => r.status === "pendente").length,
    aprovadas: mockResidences.filter((r) => r.status === "aprovado").length,
    rejeitadas: mockResidences.filter((r) => r.status === "rejeitada").length,
  }
}
