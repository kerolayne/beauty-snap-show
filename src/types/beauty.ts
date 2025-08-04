export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  foto_url?: string;
  created_at?: string;
}

export interface Trabalho {
  id: string;
  profissional_id: string;
  titulo: string;
  descricao: string;
  preco: number;
  imagem_url?: string;
  duracao_minutos: number;
  profissional?: Profissional;
  created_at?: string;
}

export interface Horario {
  id: string;
  profissional_id: string;
  trabalho_id: string;
  data: string;
  hora: string;
  disponivel: boolean;
  trabalho?: Trabalho;
  profissional?: Profissional;
  created_at?: string;
}

export interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone: string;
  trabalho_id: string;
  horario_id: string;
  status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado';
  observacoes?: string;
  trabalho?: Trabalho;
  horario?: Horario;
  created_at?: string;
}

export interface Avaliacao {
  id: string;
  agendamento_id: string;
  nota: number;
  comentario?: string;
  data: string;
  agendamento?: Agendamento;
  created_at?: string;
}