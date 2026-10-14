export interface TermoGlossario {
  id: string;
  tag: string;
  title: string;
  desc: string;
  lei: string;
}

export const GLOSSARIO: TermoGlossario[] = [
  { id: 'salario-base', tag: 'Remuneração', title: 'Salário Base',
    desc: 'Valor fixo mensal acordado em contrato de trabalho como contraprestação pelos serviços prestados.',
    lei: '📜 CLT, Art. 457 — "Compreendem-se na remuneração do empregado, para todos os efeitos legais, além do salário devido e pago diretamente pelo empregador, as gorjetas que receber."' },
  { id: 'periculosidade', tag: 'Remuneração', title: 'Adicional de Periculosidade',
    desc: 'Acréscimo de 30% sobre o salário base devido a empregados que trabalham em condições de risco acentuado à vida ou à saúde (eletricidade, explosivos, inflamáveis, etc.).',
    lei: '📜 CLT, Art. 193 e NR-16 — Atividades e operações perigosas. Portaria MTE nº 1.885/2013.' },
  { id: 'gratificacao', tag: 'Remuneração', title: 'Gratificação',
    desc: 'Valor pago com habitualidade em razão de cargo de confiança, função ou produtividade. Quando habitual, integra a remuneração para todos os efeitos legais — entra na base de INSS, IRRF, FGTS, 13º e férias.',
    lei: '📜 CLT, Art. 457, §1º — "Integram o salário a importância fixa estipulada, as gratificações legais e as comissões pagas pelo empregador."' },
  { id: 'comissao', tag: 'Remuneração', title: 'Comissão',
    desc: 'Remuneração variável vinculada a vendas ou metas. Integra o salário para todos os efeitos legais, incidindo sobre ela INSS, IRRF, FGTS e provisões de 13º e férias. Não inclui o reflexo do DSR sobre comissões, que deve ser apurado à parte na folha real.',
    lei: '📜 CLT, Art. 457, §1º; Lei nº 3.207/1957 — regula a profissão de vendedor comissionista.' },
  { id: 'inss-empregado', tag: 'Desconto Empregado', title: 'INSS do Empregado',
    desc: 'Contribuição previdenciária descontada do salário do empregado, calculada de forma progressiva sobre a remuneração bruta, que garante acesso a aposentadoria, auxílio-doença, salário-maternidade e demais benefícios do RGPS.',
    lei: '📜 Lei nº 8.212/1991, Art. 20. Portaria Interministerial MPS/MF nº 13/2026 — tabela de alíquotas progressivas 2026.' },
  { id: 'irrf', tag: 'Desconto Empregado', title: 'IRRF — Imposto de Renda Retido na Fonte',
    desc: 'Imposto sobre a renda do empregado, retido pela empresa e recolhido mensalmente. Calculado de forma progressiva sobre a base (remuneração bruta − a maior entre o INSS e o desconto simplificado de R$ 607,20). Em 2026, um redutor zera o imposto para rendimentos brutos até R$ 5.000 e o reduz gradualmente até R$ 7.350.',
    lei: '📜 Lei nº 7.713/1988; RIR/2018 (Decreto 9.580); Lei nº 15.270/2025 — redutor para rendimentos até R$ 7.350, vigente desde 01/01/2026.' },
  { id: 'fgts', tag: 'Encargo Empresa', title: 'FGTS — Fundo de Garantia por Tempo de Serviço',
    desc: 'Depósito mensal obrigatório de 8% sobre a remuneração bruta do empregado, realizado pela empresa em conta vinculada na Caixa Econômica Federal. O saldo pertence ao empregado e pode ser sacado em casos de demissão sem justa causa, aposentadoria, doenças graves, entre outros.',
    lei: '📜 Lei nº 8.036/1990, Art. 15 — "O empregador fica obrigado a depositar até o dia 7 de cada mês, em conta bancária vinculada, a importância correspondente a 8% da remuneração paga ou devida."' },
  { id: 'inss-patronal', tag: 'Encargo Empresa — Lucro Presumido', title: 'INSS Patronal',
    desc: 'Contribuição previdenciária de 20% sobre a folha de salários paga pela empresa ao INSS para financiamento da Previdência Social. Empresas do Simples Nacional têm esse encargo incluído na DAS, exceto atividades do Anexo IV, que recolhem a CPP de 20% fora do DAS.',
    lei: '📜 Lei nº 8.212/1991, Art. 22, I — "Vinte por cento sobre o total das remunerações pagas, devidas ou creditadas a qualquer título, durante o mês, aos segurados empregados e trabalhadores avulsos."' },
  { id: 'rat-fap', tag: 'Encargo Empresa — Lucro Presumido', title: 'RAT/FAP — Riscos Ambientais do Trabalho',
    desc: 'Contribuição para custeio de benefícios por incapacidade laboral. A alíquota efetiva é RAT × FAP: a alíquota base (1%, 2% ou 3%) varia conforme o grau de risco da atividade (CNAE) e é multiplicada pelo FAP, que pode variar de 0,5 a 2,0 conforme o histórico de acidentes da empresa — podendo chegar a 6% em empresas com FAP no teto. O simulador traz uma lista curada com os CNAEs mais comuns (verificados individualmente, não uma tabela raspada automaticamente); para atividades fora da lista, selecione "Outra atividade" e confirme o grau oficial do CNAE do cliente antes de informar o FAP, que é sempre específico da empresa e não pode ser deduzido do CNAE.',
    lei: '📜 Lei nº 8.212/1991, Art. 22, II; Lei nº 10.666/2003, Art. 10; Decreto nº 6.042/2007 — metodologia do FAP; Decreto nº 3.048/1999, Anexo V, e IN RFB nº 971/2009 — grau de risco por CNAE.' },
  { id: 'terceiros', tag: 'Encargo Empresa — Lucro Presumido', title: 'Terceiros — Sistema S',
    desc: 'Contribuições destinadas a entidades do Sistema S (SENAI, SESI, SENAC, SESC, SEBRAE, INCRA, FNDE, entre outros), totalizando aproximadamente 5,8% sobre a folha. Os percentuais variam conforme o CNAE da empresa.',
    lei: '📜 Diversas leis específicas de cada entidade. Decreto-Lei nº 2.318/1986; Lei nº 8.029/1990. IN RFB nº 971/2009 consolida as alíquotas por atividade.' },
  { id: 'vale-transporte', tag: 'Benefício', title: 'Vale-Transporte',
    desc: 'Benefício obrigatório que custeia o deslocamento casa-trabalho-casa do empregado. O empregador antecipa o custo e desconta do empregado até 6% do salário base. O excedente é custo da empresa.',
    lei: '📜 Lei nº 7.418/1985 e Decreto nº 95.247/1987 — "O empregador participará dos gastos de deslocamento do trabalhador com a ajuda de custo equivalente às despesas realizadas com vale-transporte." Desconto limitado a 6% do salário.' },
  { id: 'vale-alimentacao', tag: 'Benefício', title: 'Vale-Alimentação / Refeição',
    desc: 'Benefício não obrigatório por lei federal, mas amplamente previsto em convenções coletivas. Quando concedido, não integra o salário para fins de encargos trabalhistas e previdenciários (se dentro do PAT — Programa de Alimentação do Trabalhador).',
    lei: '📜 Lei nº 6.321/1976 — PAT. Portaria MTE nº 3/2021. CLT, Art. 458, §2º — itens que não integram salário quando fornecidos pelo empregador.' },
  { id: 'decimo-terceiro', tag: 'Provisão', title: '13º Salário',
    desc: 'Gratificação natalina obrigatória equivalente a 1/12 da remuneração de dezembro por mês trabalhado. Deve ser provisionado mensalmente para não impactar o fluxo de caixa de dezembro e novembro.',
    lei: '📜 CF/1988, Art. 7º, VIII; Lei nº 4.090/1962 — institui a gratificação natalina. "Corresponde a 1/12 da remuneração devida em dezembro por mês de serviço do ano correspondente."' },
  { id: 'ferias', tag: 'Provisão', title: 'Férias e 1/3 Constitucional',
    desc: 'Todo empregado tem direito a 30 dias de férias remuneradas após cada período aquisitivo de 12 meses, acrescidas de 1/3 do salário. O simulador provisiona apenas o adicional de 1/3 (1/12 ÷ 3) e o FGTS sobre ele: a remuneração das férias em si já é paga no salário do mês, portanto não gera custo adicional.',
    lei: '📜 CF/1988, Art. 7º, XVII; CLT, Arts. 129 a 153 — "Após cada período de 12 meses de vigência do contrato de trabalho, o empregado terá direito a férias... acrescido de, pelo menos, um terço a mais do que o salário normal."' },
];
