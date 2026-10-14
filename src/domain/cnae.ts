import type { GrauRisco } from './types';

export interface Cnae { codigo: string; descricao: string; grau: GrauRisco }

/**
 * Lista curada (verificada individualmente — não é o Anexo V completo, que tem
 * ~1.300 subclasses). Fora dela, o usuário escolhe o grau manualmente.
 */
export const CNAES: Cnae[] = [
  { codigo: '6920-6/01', descricao: 'Serviços de contabilidade', grau: 1 },
  { codigo: '6201-5/01', descricao: 'Desenvolvimento de programas sob encomenda (TI)', grau: 1 },
  { codigo: '8630-5/03', descricao: 'Atividade médica ambulatorial — consultas', grau: 1 },
  { codigo: '8599-6/04', descricao: 'Treinamento profissional e gerencial', grau: 1 },
  { codigo: '4781-4/00', descricao: 'Comércio varejista de vestuário e acessórios', grau: 2 },
  { codigo: '6810-2/02', descricao: 'Aluguel de imóveis próprios (imobiliária)', grau: 2 },
  { codigo: '8211-3/00', descricao: 'Escritório e apoio administrativo', grau: 2 },
  { codigo: '5510-8/01', descricao: 'Hotéis', grau: 2 },
  { codigo: '9602-5/01', descricao: 'Cabeleireiros, manicure e pedicure', grau: 2 },
  { codigo: '5611-2/01', descricao: 'Restaurantes e similares', grau: 2 },
  { codigo: '4120-4/00', descricao: 'Construção de edifícios', grau: 3 },
  { codigo: '4711-3/02', descricao: 'Comércio varejista de mercadorias em geral (supermercado)', grau: 3 },
  { codigo: '4930-2/02', descricao: 'Transporte rodoviário de carga', grau: 3 },
  { codigo: '4520-0/01', descricao: 'Manutenção e reparação de veículos automotores', grau: 3 },
];

export const CNAE_OUTRA = 'outra';
export const CNAE_PADRAO = '8211-3/00';

export const ROTULO_GRAU: Record<GrauRisco, string> = {
  1: 'Risco leve — 1%',
  2: 'Risco médio — 2%',
  3: 'Risco grave — 3%',
};
