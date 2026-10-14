import type { Regime } from './types';

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const regimeLabel = (r: Regime, anexoIV = false) =>
  r === 'presumido' ? 'Lucro Presumido' : anexoIV ? 'Simples Nacional (Anexo IV)' : 'Simples Nacional';

/** Alíquota (0,058 → "5,8%") sem ruído de ponto flutuante. */
export const pct = (v: number) =>
  `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}%`;
