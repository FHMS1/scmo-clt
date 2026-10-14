import type { Regime } from './types';

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const regimeLabel = (r: Regime, anexoIV = false) =>
  r === 'presumido' ? 'Lucro Presumido' : anexoIV ? 'Simples Nacional (Anexo IV)' : 'Simples Nacional';
