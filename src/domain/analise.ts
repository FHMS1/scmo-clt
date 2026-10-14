import { simular } from './simulador';
import { TABELAS } from './tabelas2026';
import type { EntradaSimulacao, ResultadoSimulacao, Tabelas } from './types';

export type SegmentoId = 'remuneracao' | 'fgts' | 'patronal' | 'beneficios' | 'provisoes';

export interface Segmento {
  id: SegmentoId;
  label: string;
  valor: number;
}

/**
 * Para onde vai cada real do custo total (mensal + provisões).
 * A soma dos segmentos é exatamente `custoComProvisoes`.
 */
export function composicaoCusto(r: ResultadoSimulacao): Segmento[] {
  return [
    { id: 'remuneracao', label: 'Remuneração bruta', valor: r.remuneracaoBruta },
    { id: 'fgts', label: 'FGTS', valor: r.fgts },
    { id: 'patronal', label: 'Encargos patronais', valor: r.totalEncargosPatronais },
    { id: 'beneficios', label: 'Benefícios', valor: r.vtCustoEmpresa + r.va },
    { id: 'provisoes', label: 'Provisões (13º e 1/3 de férias)', valor: r.totalProvisoes },
  ];
}

export type CenarioId = 'simples' | 'simples-iv' | 'presumido';

export interface Cenario {
  id: CenarioId;
  label: string;
  custoMensal: number;
  custoComProvisoes: number;
  encargosPatronais: number;
}

const CENARIOS: { id: CenarioId; label: string; regime: 'simples' | 'presumido'; anexoIV: boolean }[] = [
  { id: 'simples', label: 'Simples Nacional', regime: 'simples', anexoIV: false },
  { id: 'simples-iv', label: 'Simples — Anexo IV', regime: 'simples', anexoIV: true },
  { id: 'presumido', label: 'Lucro Presumido', regime: 'presumido', anexoIV: false },
];

/** Mesma entrada calculada nos três enquadramentos, para comparação lado a lado. */
export function compararRegimes(e: EntradaSimulacao, t: Tabelas = TABELAS): Cenario[] {
  return CENARIOS.map((c) => {
    const r = simular({ ...e, regime: c.regime, simplesAnexoIV: c.anexoIV }, t);
    return {
      id: c.id,
      label: c.label,
      custoMensal: r.custoMensal,
      custoComProvisoes: r.custoComProvisoes,
      encargosPatronais: r.totalEncargosPatronais,
    };
  });
}

/** Cenário que corresponde ao regime atualmente selecionado no formulário. */
export function cenarioAtual(r: ResultadoSimulacao): CenarioId {
  if (r.regime === 'presumido') return 'presumido';
  return r.simplesAnexoIV ? 'simples-iv' : 'simples';
}
