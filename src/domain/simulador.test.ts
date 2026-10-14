import { describe, expect, it } from 'vitest';
import { calcularInss } from './inss';
import { calcularIrrf } from './irrf';
import { simular } from './simulador';
import { TABELAS } from './tabelas2026';
import type { EntradaSimulacao } from './types';

const base: EntradaSimulacao = {
  regime: 'simples',
  simplesAnexoIV: false,
  salarioBase: 0,
  periculosidade: { ativo: false, percentual: 30 },
  gratificacao: { ativo: false, valor: 0 },
  comissao: { ativo: false, valor: 0 },
  valeTransporte: { ativo: false, valorPassagem: 0 },
  valeAlimentacao: { ativo: false, valorDia: 0 },
  grauRisco: 2,
  fap: 1,
};
const com = (p: Partial<EntradaSimulacao>): EntradaSimulacao => ({ ...base, ...p });

describe('INSS progressivo', () => {
  it('soma faixa a faixa', () => {
    // 1621×7,5% + 1281,84×9% + 97,16×12%
    expect(calcularInss(3000, TABELAS)).toBeCloseTo(248.5998, 4);
  });
  it('respeita o teto', () => {
    expect(calcularInss(50000, TABELAS)).toBeCloseTo(calcularInss(8475.55, TABELAS), 6);
  });
  it('zero para base zero', () => {
    expect(calcularInss(0, TABELAS)).toBe(0);
  });
});

describe('IRRF 2026 (Lei 15.270/2025)', () => {
  const irrf = (bruto: number) => calcularIrrf(bruto, calcularInss(bruto, TABELAS), TABELAS);

  it('usa o desconto simplificado quando maior que o INSS', () => {
    const r = irrf(3000); // INSS 248,60 < 607,20
    expect(r.deducaoTipo).toBe('simplificado');
    expect(r.baseCalculo).toBeCloseTo(3000 - 607.2, 6);
  });
  it('usa o INSS quando maior que o desconto simplificado', () => {
    const r = irrf(6000);
    expect(r.deducaoTipo).toBe('inss');
    expect(r.deducao).toBeCloseTo(calcularInss(6000, TABELAS), 6);
  });
  it('rendimento bruto ≤ 5.000 → IRRF zerado (imposto máx. 312,89)', () => {
    for (const bruto of [3000, 4000, 4900, 5000]) {
      const r = irrf(bruto);
      expect(r.impostoFinal).toBe(0);
      expect(r.categoria).toBe('isento');
    }
    expect(irrf(5000).impostoBruto).toBeCloseTo(312.89, 2); // sem arredondar: 4.392,80 × 22,5% − 675,49
  });
  it('5.000,01 a 7.350 → redução = 978,62 − 0,133145 × bruto', () => {
    const r = irrf(6000);
    expect(r.categoria).toBe('reduzido');
    expect(r.reducao).toBeCloseTo(978.62 - 0.133145 * 6000, 6);
    expect(r.impostoFinal).toBeCloseTo(r.impostoBruto - r.reducao, 6);
  });
  it('contínuo em 7.350: redução ≈ 0 (constante 978,62)', () => {
    const r = irrf(7350);
    expect(r.reducao).toBeLessThan(0.01);
  });
  it('acima de 7.350 → sem redução', () => {
    const r = irrf(8000);
    expect(r.categoria).toBe('cheio');
    expect(r.reducao).toBe(0);
  });
});

describe('simular — Simples Nacional', () => {
  it('R$ 3.000: sem encargos patronais, FGTS 8%', () => {
    const r = simular(com({ salarioBase: 3000 }));
    expect(r.remuneracaoBruta).toBe(3000);
    expect(r.fgts).toBeCloseTo(240, 6);
    expect(r.totalEncargosPatronais).toBe(0);
    expect(r.custoMensal).toBeCloseTo(3240, 6);
    expect(r.custoHora).toBeCloseTo(3240 / 220, 6);
    expect(r.liquidoFolha).toBeCloseTo(3000 - 248.5998, 4);
  });
  it('ignora grau de risco e FAP', () => {
    const a = simular(com({ salarioBase: 3000, grauRisco: 1, fap: 0.5 }));
    const b = simular(com({ salarioBase: 3000, grauRisco: 3, fap: 2 }));
    expect(a.custoMensal).toBeCloseTo(b.custoMensal, 6);
  });
});

describe('simular — Lucro Presumido', () => {
  it('R$ 3.000, grau 2, FAP 1: INSS 20% + RAT 2% + terceiros 5,8%', () => {
    const r = simular(com({ regime: 'presumido', salarioBase: 3000 }));
    expect(r.inssPatronal).toBeCloseTo(600, 6);
    expect(r.rat).toBeCloseTo(60, 6);
    expect(r.terceiros).toBeCloseTo(174, 6);
    expect(r.custoMensal).toBeCloseTo(3000 + 240 + 600 + 60 + 174, 6);
  });
  it('RAT = grau × FAP; FAP é limitado a [0,5; 2,0]', () => {
    const r = simular(com({ regime: 'presumido', salarioBase: 1000, grauRisco: 3, fap: 5 }));
    expect(r.fap).toBe(2);
    expect(r.rat).toBeCloseTo(1000 * 0.03 * 2, 6);
  });
});

describe('simular — Simples Nacional Anexo IV', () => {
  it('CPP 20% + RAT fora do DAS; sem terceiros', () => {
    const r = simular(com({ salarioBase: 3000, simplesAnexoIV: true }));
    expect(r.patronalAplica).toBe(true);
    expect(r.inssPatronal).toBeCloseTo(600, 6);
    expect(r.rat).toBeCloseTo(60, 6);
    expect(r.terceiros).toBe(0);
    expect(r.custoMensal).toBeCloseTo(3000 + 240 + 600 + 60, 6);
  });
  it('flag Anexo IV é ignorada no Lucro Presumido', () => {
    const r = simular(com({ regime: 'presumido', salarioBase: 3000, simplesAnexoIV: true }));
    expect(r.simplesAnexoIV).toBe(false);
    expect(r.terceiros).toBeCloseTo(174, 6);
  });
});

describe('simular — remuneração e benefícios', () => {
  it('periculosidade, gratificação e comissão integram a remuneração bruta', () => {
    const r = simular(
      com({
        salarioBase: 2000,
        periculosidade: { ativo: true, percentual: 30 },
        gratificacao: { ativo: true, valor: 500 },
        comissao: { ativo: true, valor: 300 },
      }),
    );
    expect(r.valorPericulosidade).toBeCloseTo(600, 6);
    expect(r.remuneracaoBruta).toBeCloseTo(3400, 6);
  });
  it('valores de toggles desativados são ignorados', () => {
    const r = simular(com({ salarioBase: 2000, gratificacao: { ativo: false, valor: 999 } }));
    expect(r.remuneracaoBruta).toBe(2000);
  });
  it('VT: desconto limitado a 6% do salário base; custo empresa = bruto − desconto', () => {
    const r = simular(
      com({ salarioBase: 2000, valeTransporte: { ativo: true, valorPassagem: 5 } }),
    );
    expect(r.vtBruto).toBeCloseTo(5 * 2 * 22, 6); // 220
    expect(r.descontoVT).toBeCloseTo(120, 6);
    expect(r.vtCustoEmpresa).toBeCloseTo(100, 6);
  });
  it('VT: desconto nunca excede o valor do benefício', () => {
    const r = simular(
      com({ salarioBase: 5000, valeTransporte: { ativo: true, valorPassagem: 1 } }),
    );
    expect(r.descontoVT).toBeCloseTo(44, 6);
    expect(r.vtCustoEmpresa).toBe(0);
  });
  it('VA integral é custo da empresa e entra no total recebido', () => {
    const r = simular(
      com({ salarioBase: 2000, valeAlimentacao: { ativo: true, valorDia: 30 } }),
    );
    expect(r.va).toBe(660);
    expect(r.totalRecebido).toBeCloseTo(r.liquidoFolha + 660, 6);
  });
});

describe('simular — provisões', () => {
  it('13º, 1/3 de férias e FGTS incidente; não entram no custo mensal', () => {
    const r = simular(com({ salarioBase: 3000 }));
    expect(r.prov13).toBeCloseTo(250, 6);
    expect(r.provTercoFerias).toBeCloseTo(83.3333, 4);
    expect(r.fgtsSobre13).toBeCloseTo(20, 6);
    expect(r.fgtsSobreTerco).toBeCloseTo(6.6667, 4);
    expect(r.totalProvisoes).toBeCloseTo(360, 4);
    expect(r.custoComProvisoes).toBeCloseTo(r.custoMensal + r.totalProvisoes, 6);
  });
});

describe('simular — bordas', () => {
  it('entrada zerada não gera NaN', () => {
    const r = simular(base);
    expect(Object.values(r).filter((v) => typeof v === 'number').every(Number.isFinite)).toBe(true);
    expect(r.custoMensal).toBe(0);
  });
  it('valores negativos são tratados como zero', () => {
    const r = simular(com({ salarioBase: -100 }));
    expect(r.remuneracaoBruta).toBe(0);
  });
});
