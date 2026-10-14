import type { Tabelas } from './types';

/**
 * Tabelas vigentes. Atualizar este arquivo (e só ele) a cada início de ano.
 * INSS: Portaria Interministerial MPS/MF nº 13/2026 · IRRF: tabela RFB + redutor da Lei 15.270/2025.
 */
export const TABELAS: Tabelas = {
  anoTabelas: 2026,

  inssFaixas: [
    { teto: 1621.0, aliq: 0.075 },
    { teto: 2902.84, aliq: 0.09 },
    { teto: 4354.27, aliq: 0.12 },
    { teto: 8475.55, aliq: 0.14 },
  ],
  inssTeto: 8475.55,

  irrfFaixas: [
    { teto: 2428.8, aliq: 0, ded: 0 },
    { teto: 2826.65, aliq: 0.075, ded: 182.16 },
    { teto: 3751.05, aliq: 0.15, ded: 394.16 },
    { teto: 4664.68, aliq: 0.225, ded: 675.49 },
    { teto: Infinity, aliq: 0.275, ded: 908.73 },
  ],
  irrfDescontoSimplificado: 607.2, // 25% do teto da faixa isenta (2.428,80)
  irrfIsencaoTeto: 5000,
  irrfReducaoTeto: 7350,
  irrfDescontoMax: 312.89,
  irrfReducaoConstante: 978.62,
  irrfReducaoFator: 0.133145,

  inssPatronal: 0.2,
  terceiros: 0.058,
  fgts: 0.08,

  vtDescPct: 0.06,
  vtPassagens: 2,
  vtDias: 22,
  vaDias: 22,
  horasMes: 220,
};
