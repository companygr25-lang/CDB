
export interface DeliveryRecord {
  id: string;
  dataProcessamento: string;
  placa: string;
  motorista: string;
  ajudantes: string;
  rota: string;
  carga: string;
  entregas: number;
  valor: number;
  mes: string;
}

export interface Occurrence {
  id: string;
  motorista: string;
  data: string;
  tipo: 'Volta' | 'Devolução';
  motivo: string;
  quantidade: number;
  valor: number;
}

export type ViewType = 'dashboard' | 'upload' | 'manual';

export interface MonthlyStats {
  mes: string;
  totalEntregas: number;
  totalValor: number;
  totalCarga: number;
}
