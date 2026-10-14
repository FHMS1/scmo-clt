import { describe, expect, it } from 'vitest';
import { cenarioAtual, compararRegimes, composicaoCusto } from './analise';
import { simular } from './simulador';
import type { EntradaSimulacao } from './types';

const entrada: EntradaSimulacao = {
  regime: 'presumido',
  simplesAnexoIV: false,
  salarioBase: 3000,
  periculosidade: { ativo: true, percentual: 30 },
  gratificacao: { ativo: false, valor: 0 },
  comissao: { ativo: true, valor: 500 },
  valeTransporte: { ativo: true, valorPassagem: 5 },
  valeAlimentacao: { ativo: true, valorDia: 30 },
  grauRisco: 2,
  fap: 1,
};

describe('composicaoCusto', () => {
  it('a soma dos segmentos é o custo total com provisões', () => {
    const r = simular(entrada);
    const soma = composicaoCusto(r).reduce((s, x) => s + x.valor, 0);
    expect(soma).toBeCloseTo(r.custoComProvisoes, 6);
  });
});

describe('compararRegimes', () => {
  it('Presumido ≥ Anexo IV ≥ Simples comum, com a mesma remuneração', () => {
    const [simples, iv, presumido] = compararRegimes(entrada);
    expect(simples.custoMensal).toBeLessThan(iv.custoMensal);
    expect(iv.custoMensal).toBeLessThan(presumido.custoMensal);
  });
  it('o cenário do regime selecionado bate com simular()', () => {
    const r = simular(entrada);
    const atual = compararRegimes(entrada).find((c) => c.id === cenarioAtual(r))!;
    expect(atual.custoMensal).toBeCloseTo(r.custoMensal, 6);
  });
});
