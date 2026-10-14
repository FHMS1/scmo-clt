export type Regime = 'simples' | 'presumido';
export type GrauRisco = 1 | 2 | 3;
export type CategoriaIrrf = 'isento' | 'reduzido' | 'cheio';

export interface FaixaInss { teto: number; aliq: number }
export interface FaixaIrrf { teto: number; aliq: number; ded: number }

/** Parâmetros que mudam por ano/portaria. Única fonte de verdade das tabelas. */
export interface Tabelas {
  anoTabelas: number;
  inssFaixas: FaixaInss[];
  inssTeto: number;
  irrfFaixas: FaixaIrrf[];
  irrfDescontoSimplificado: number;
  irrfIsencaoTeto: number;
  irrfReducaoTeto: number;
  irrfDescontoMax: number;
  irrfReducaoConstante: number;
  irrfReducaoFator: number;
  inssPatronal: number;
  terceiros: number;
  fgts: number;
  vtDescPct: number;
  vtPassagens: number;
  vtDias: number;
  vaDias: number;
  horasMes: number;
}

/** Entrada numérica já normalizada (o formulário converte strings em números). */
export interface EntradaSimulacao {
  regime: Regime;
  /** Só vale no Simples: CPP (20%) e RAT recolhidos fora do DAS. */
  simplesAnexoIV: boolean;
  salarioBase: number;
  periculosidade: { ativo: boolean; percentual: number };
  gratificacao: { ativo: boolean; valor: number };
  comissao: { ativo: boolean; valor: number };
  valeTransporte: { ativo: boolean; valorPassagem: number };
  valeAlimentacao: { ativo: boolean; valorDia: number };
  grauRisco: GrauRisco;
  fap: number;
}

export interface ResultadoIrrf {
  impostoFinal: number;
  impostoBruto: number;
  reducao: number;
  categoria: CategoriaIrrf;
  /** Base sobre a qual a tabela foi aplicada (bruto − dedução). */
  baseCalculo: number;
  deducao: number;
  deducaoTipo: 'inss' | 'simplificado';
}

export interface ResultadoSimulacao {
  regime: Regime;
  simplesAnexoIV: boolean;
  /** CPP + RAT incidem (Presumido ou Simples Anexo IV). */
  patronalAplica: boolean;
  // remuneração
  salarioBase: number;
  valorPericulosidade: number;
  valorGratificacao: number;
  valorComissao: number;
  remuneracaoBruta: number;
  // descontos do empregado
  inssEmpregado: number;
  irrf: ResultadoIrrf;
  descontoVT: number;
  // encargos da empresa
  fgts: number;
  inssPatronal: number;
  rat: number;
  terceiros: number;
  totalEncargosPatronais: number;
  grauRisco: GrauRisco;
  fap: number;
  // benefícios
  vtBruto: number;
  vtCustoEmpresa: number;
  va: number;
  // totais
  custoMensal: number;
  custoHora: number;
  liquidoFolha: number;
  totalRecebido: number;
  // provisões
  prov13: number;
  provTercoFerias: number;
  fgtsSobre13: number;
  fgtsSobreTerco: number;
  totalProvisoes: number;
  custoComProvisoes: number;
  horaComProvisoes: number;
}
