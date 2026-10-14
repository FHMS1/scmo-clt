import { calcularInss } from './inss';
import { calcularIrrf } from './irrf';
import { TABELAS } from './tabelas2026';
import type { EntradaSimulacao, ResultadoSimulacao, Tabelas } from './types';

const pos = (v: number) => Math.max(0, Number.isFinite(v) ? v : 0);

/** Função pura: mesma entrada → mesmo resultado. Sem DOM, sem estado. */
export function simular(e: EntradaSimulacao, t: Tabelas = TABELAS): ResultadoSimulacao {
  const presumido = e.regime === 'presumido';
  const anexoIV = e.regime === 'simples' && e.simplesAnexoIV;
  // Presumido: CPP + RAT + terceiros. Simples Anexo IV: CPP + RAT fora do DAS (sem terceiros).
  const patronalAplica = presumido || anexoIV;

  // Remuneração
  const salarioBase = pos(e.salarioBase);
  const valorPericulosidade = e.periculosidade.ativo
    ? salarioBase * (pos(e.periculosidade.percentual) / 100)
    : 0;
  const valorGratificacao = e.gratificacao.ativo ? pos(e.gratificacao.valor) : 0;
  const valorComissao = e.comissao.ativo ? pos(e.comissao.valor) : 0;
  const remuneracaoBruta = salarioBase + valorPericulosidade + valorGratificacao + valorComissao;

  // Descontos do empregado
  const inssEmpregado = calcularInss(remuneracaoBruta, t);
  const irrf = calcularIrrf(remuneracaoBruta, inssEmpregado, t);

  // Encargos da empresa
  const fgts = remuneracaoBruta * t.fgts;
  const fap = patronalAplica ? Math.min(2, Math.max(0.5, e.fap || 1)) : 1;
  const ratEfetivo = (e.grauRisco / 100) * fap;
  const inssPatronal = patronalAplica ? remuneracaoBruta * t.inssPatronal : 0;
  const rat = patronalAplica ? remuneracaoBruta * ratEfetivo : 0;
  const terceiros = presumido ? remuneracaoBruta * t.terceiros : 0;
  const totalEncargosPatronais = inssPatronal + rat + terceiros;

  // Benefícios
  let vtBruto = 0;
  let descontoVT = 0;
  let vtCustoEmpresa = 0;
  if (e.valeTransporte.ativo) {
    vtBruto = pos(e.valeTransporte.valorPassagem) * t.vtPassagens * t.vtDias;
    descontoVT = Math.min(salarioBase * t.vtDescPct, vtBruto);
    vtCustoEmpresa = vtBruto - descontoVT;
  }
  const va = e.valeAlimentacao.ativo ? pos(e.valeAlimentacao.valorDia) * t.vaDias : 0;

  // Totais (sem provisões)
  const custoMensal =
    remuneracaoBruta + fgts + inssPatronal + rat + terceiros + vtCustoEmpresa + va;
  const custoHora = custoMensal / t.horasMes;
  const liquidoFolha = remuneracaoBruta - inssEmpregado - descontoVT - irrf.impostoFinal;
  const totalRecebido = liquidoFolha + vtBruto + va;

  // Provisões (13º e 1/3 de férias, com FGTS incidente)
  const prov13 = remuneracaoBruta / 12;
  const provTercoFerias = remuneracaoBruta / 12 / 3;
  const fgtsSobre13 = prov13 * t.fgts;
  const fgtsSobreTerco = provTercoFerias * t.fgts;
  const totalProvisoes = prov13 + provTercoFerias + fgtsSobre13 + fgtsSobreTerco;
  const custoComProvisoes = custoMensal + totalProvisoes;
  const horaComProvisoes = custoComProvisoes / t.horasMes;

  return {
    regime: e.regime, simplesAnexoIV: anexoIV, patronalAplica,
    salarioBase, valorPericulosidade, valorGratificacao, valorComissao, remuneracaoBruta,
    inssEmpregado, irrf, descontoVT,
    fgts, inssPatronal, rat, terceiros, totalEncargosPatronais,
    grauRisco: e.grauRisco, fap,
    vtBruto, vtCustoEmpresa, va,
    custoMensal, custoHora, liquidoFolha, totalRecebido,
    prov13, provTercoFerias, fgtsSobre13, fgtsSobreTerco, totalProvisoes,
    custoComProvisoes, horaComProvisoes,
  };
}
