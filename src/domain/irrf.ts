import type { ResultadoIrrf, Tabelas } from './types';

const centavos = (v: number) => Math.round(v * 100) / 100;

/**
 * IRRF mensal (Lei 15.270/2025, vigente desde 01/01/2026).
 *
 * 1) Dedução: a maior entre o INSS do empregado e o desconto simplificado (25% da faixa isenta).
 * 2) Imposto pela tabela progressiva sobre (rendimento bruto − dedução).
 * 3) Redução, apurada sobre o RENDIMENTO BRUTO (não sobre a base):
 *    - bruto ≤ 5.000            → até R$ 312,89, limitada ao imposto (zera o IRRF);
 *    - 5.000,01 a 7.350         → 978,62 − 0,133145 × bruto, limitada ao imposto;
 *    - acima de 7.350           → sem redução.
 */
export function calcularIrrf(rendimentoBruto: number, inss: number, t: Tabelas): ResultadoIrrf {
  const usaSimplificado = t.irrfDescontoSimplificado > inss;
  const deducao = usaSimplificado ? t.irrfDescontoSimplificado : inss;
  const baseCalculo = Math.max(0, rendimentoBruto - deducao);

  let impostoBruto = 0;
  for (const f of t.irrfFaixas) {
    if (baseCalculo <= 0) break;
    if (baseCalculo <= f.teto) {
      impostoBruto = baseCalculo * f.aliq - f.ded;
      break;
    }
  }
  impostoBruto = centavos(Math.max(0, impostoBruto));

  let reducao = 0;
  if (rendimentoBruto <= t.irrfIsencaoTeto) {
    reducao = Math.min(impostoBruto, t.irrfDescontoMax);
  } else if (rendimentoBruto <= t.irrfReducaoTeto) {
    reducao = Math.max(0, t.irrfReducaoConstante - t.irrfReducaoFator * rendimentoBruto);
    reducao = Math.min(centavos(reducao), impostoBruto);
  }

  const impostoFinal = Math.max(0, impostoBruto - reducao);
  const categoria = impostoFinal === 0 ? 'isento' : reducao > 0 ? 'reduzido' : 'cheio';
  return {
    impostoFinal, impostoBruto, reducao, categoria,
    baseCalculo, deducao, deducaoTipo: usaSimplificado ? 'simplificado' : 'inss',
  };
}
