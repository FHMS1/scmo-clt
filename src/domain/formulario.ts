import { CNAES, CNAE_OUTRA, CNAE_PADRAO } from './cnae';
import type { EntradaSimulacao, GrauRisco, Regime } from './types';

/** Estado bruto do formulário: campos numéricos ficam como string (permite campo vazio). */
export interface FormState {
  regime: Regime;
  anexoIV: boolean;        // Simples: atividade com CPP fora do DAS
  salarioBase: string;
  chkPeri: boolean; percPeri: string;
  chkGrat: boolean; valorGrat: string;
  chkCom: boolean; valorCom: string;
  chkVT: boolean; valorPassagem: string;
  chkVA: boolean; valorDiaVA: string;
  cnae: string;            // código da lista curada ou CNAE_OUTRA
  grauManual: GrauRisco;   // usado só quando cnae === CNAE_OUTRA
  fap: string;
}

export const FORM_INICIAL: FormState = {
  regime: 'simples',
  anexoIV: false,
  salarioBase: '',
  chkPeri: false, percPeri: '30',
  chkGrat: false, valorGrat: '',
  chkCom: false, valorCom: '',
  chkVT: false, valorPassagem: '',
  chkVA: false, valorDiaVA: '',
  cnae: CNAE_PADRAO,
  grauManual: 2,
  fap: '1.0000',
};

const num = (s: string) => parseFloat(s) || 0;

export function grauDoFormulario(f: FormState): GrauRisco {
  if (f.cnae === CNAE_OUTRA) return f.grauManual;
  return CNAES.find((c) => c.codigo === f.cnae)?.grau ?? f.grauManual;
}

export function formParaEntrada(f: FormState): EntradaSimulacao {
  return {
    regime: f.regime,
    simplesAnexoIV: f.anexoIV,
    salarioBase: num(f.salarioBase),
    periculosidade: { ativo: f.chkPeri, percentual: num(f.percPeri) },
    gratificacao: { ativo: f.chkGrat, valor: num(f.valorGrat) },
    comissao: { ativo: f.chkCom, valor: num(f.valorCom) },
    valeTransporte: { ativo: f.chkVT, valorPassagem: num(f.valorPassagem) },
    valeAlimentacao: { ativo: f.chkVA, valorDia: num(f.valorDiaVA) },
    grauRisco: grauDoFormulario(f),
    fap: num(f.fap) || 1,
  };
}
