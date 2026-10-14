import type { Tabelas } from './types';

/** INSS do empregado — cálculo progressivo (faixa a faixa), limitado ao teto. */
export function calcularInss(base: number, t: Tabelas): number {
  const rem = Math.min(base, t.inssTeto);
  let total = 0;
  let anterior = 0;
  for (const f of t.inssFaixas) {
    if (rem <= anterior) break;
    total += (Math.min(rem, f.teto) - anterior) * f.aliq;
    anterior = f.teto;
  }
  return total;
}
