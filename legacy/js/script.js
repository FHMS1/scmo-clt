// ══════════════════════════════════════════════════════════════
//  CONFIG — atualizar conforme portarias e tabelas vigentes
// ══════════════════════════════════════════════════════════════
const CONFIG = {

  // INSS empregado — tabela progressiva 2025
  inss_faixas: [
    { teto: 1621.00, aliq: 0.075 },
    { teto: 2902.84, aliq: 0.09  },
    { teto: 4354.27, aliq: 0.12  },
    { teto: 8475.55, aliq: 0.14  },
  ],
  inss_teto: 8475.55,

  // IRRF 2026 — tabela progressiva (base = rem. bruta - INSS)
  irrf_faixas: [
    { teto: 2428.80, aliq: 0,      ded: 0      },
    { teto: 2826.65, aliq: 0.075,  ded: 182.16 },
    { teto: 3751.05, aliq: 0.15,   ded: 394.16 },
    { teto: 4664.68, aliq: 0.225,  ded: 675.49 },
    { teto: Infinity,aliq: 0.275,  ded: 908.73 },
  ],

  // Redução de IRRF (isenção até R$5k — MP 1.294/2024)
  // Aplica sobre o imposto calculado:
  // • base ≤ 5000,00 → desconto de até R$312,89 (zerando o imposto)
  // • 5000,01 a 7350,00 → redução = 979,62 - (0,133145 × base)
  // • > 7350,00 → sem redução
  irrf_isencao_teto:      5000.00,
  irrf_reducao_teto:      7350.00,
  irrf_desconto_max:       312.89,
  irrf_reducao_constante:  979.62,
  irrf_reducao_fator:      0.133145,

  // Encargos patronais — Lucro Presumido
  inss_patronal: 0.20,
  terceiros:     0.058,

  // FGTS
  fgts:          0.08,

  // Vale-transporte
  vt_desc_pct:   0.06,
  vt_passagens:  2,
  vt_dias:       22,

  // Vale-alimentação
  va_dias:       22,

  // Divisor horas mensais
  horas_mes:     220,
  ano_tabelas: 2026,   // ← atualizar aqui todo início de ano
};

// ══════════════════════════════════════════════════════════════
//  UTILITÁRIOS
// ══════════════════════════════════════════════════════════════
const fmt  = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const n    = id => parseFloat(document.getElementById(id)?.value) || 0;
const chk  = id => document.getElementById(id)?.checked ?? false;
function set(id, val)     { const e = document.getElementById(id); if (e) e.textContent = fmt(val); }
function setText(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }
function pulse(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth;
  el.classList.add('flash');
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

// ══════════════════════════════════════════════════════════════
//  CÁLCULO INSS PROGRESSIVO
// ══════════════════════════════════════════════════════════════
function calcINSS(base) {
  const rem = Math.min(base, CONFIG.inss_teto);
  let total = 0, ant = 0;
  for (const f of CONFIG.inss_faixas) {
    if (rem <= ant) break;
    total += (Math.min(rem, f.teto) - ant) * f.aliq;
    ant = f.teto;
  }
  return total;
}

// ══════════════════════════════════════════════════════════════
//  CÁLCULO IRRF 2026 com isenção até R$ 5.000
// ══════════════════════════════════════════════════════════════
function calcIRRF(baseIRRF) {
  // 1. Imposto bruto pela tabela progressiva
  let impostoBruto = 0;
  for (const f of CONFIG.irrf_faixas) {
    if (baseIRRF <= 0) break;
    if (baseIRRF <= f.teto) {
      impostoBruto = baseIRRF * f.aliq - f.ded;
      break;
    }
  }
  impostoBruto = Math.max(0, impostoBruto);

  // 2. Redução/isenção (MP 1.294/2024)
  let reducao = 0;
  if (baseIRRF <= CONFIG.irrf_isencao_teto) {
    // Zera o imposto (desconto = valor do imposto, até 312,89)
    reducao = Math.min(impostoBruto, CONFIG.irrf_desconto_max);
  } else if (baseIRRF <= CONFIG.irrf_reducao_teto) {
    // Redução parcial progressiva
    reducao = Math.max(0, CONFIG.irrf_reducao_constante - CONFIG.irrf_reducao_fator * baseIRRF);
    reducao = Math.min(reducao, impostoBruto);
  }
  // Acima de 7.350,01 → sem redução

  const impostoFinal = Math.max(0, impostoBruto - reducao);

  // Categoria para badge
  let categoria = 'cheio';
  if (impostoFinal === 0)   categoria = 'isento';
  else if (reducao > 0)     categoria = 'reduzido';

  return { impostoFinal, impostoBruto, reducao, categoria };
}

// ══════════════════════════════════════════════════════════════
//  REGIME TRIBUTÁRIO
// ══════════════════════════════════════════════════════════════
function getRegime() {
  return document.querySelector('input[name="regime"]:checked')?.value || 'simples';
}

function onRegime() {
  const regime = getRegime();
  const isP    = regime === 'presumido';
  document.getElementById('pill-simples').className   = 'rpill' + (regime === 'simples' ? ' sel-simples'   : '');
  document.getElementById('pill-presumido').className = 'rpill' + (isP                 ? ' sel-presumido' : '');
  document.getElementById('bloco-enc').style.display  = isP ? 'block' : 'none';
  document.getElementById('rows-pat').style.display   = isP ? 'block' : 'none';
  calcular();
}

// ══════════════════════════════════════════════════════════════
//  ATIVIDADE (CNAE) → GRAU DE RISCO RAT
// ══════════════════════════════════════════════════════════════
function onCnaeChange() {
  const sel        = document.getElementById('cnaeAtividade');
  const manualWrap = document.getElementById('fg-ratManual');
  const hint       = document.getElementById('cnaeHint');
  const pctTexto   = { '1': '1%', '2': '2%', '3': '3%' };

  if (sel.value === 'outra') {
    manualWrap.style.display = 'block';
    hint.textContent = '⚠️ Selecione o grau de risco manualmente e confirme no Anexo V do Decreto nº 3.048/1999 (ou no CNAE oficial do cliente).';
  } else {
    manualWrap.style.display = 'none';
    const [cnae, grau] = sel.value.split('|');
    document.getElementById('ratGrau').value = grau;
    hint.textContent = `📌 CNAE ${cnae} · grau de risco ${grau} (${pctTexto[grau]}). Lista curada — fora dela, use "Outra atividade".`;
  }
  calcular();
}

// ══════════════════════════════════════════════════════════════
//  TOGGLE SUB-CAMPOS
// ══════════════════════════════════════════════════════════════
function toggleSub(chkId, divId, rowId) {
  const on = chk(chkId);
  document.getElementById(divId).style.display = on ? 'block' : 'none';
  document.getElementById(rowId).classList.toggle('on', on);
}

// ══════════════════════════════════════════════════════════════
//  CÁLCULO PRINCIPAL
// ══════════════════════════════════════════════════════════════
function calcular() {
  const regime = getRegime();
  const isP    = regime === 'presumido';

  // ── Remuneração ──
  const salBase  = Math.max(0, n('salarioBase'));
  const percPeri = chk('chkPeri') ? Math.max(0, n('percPeri')) : 0;
  const valPeri  = salBase * (percPeri / 100);
  const valGrat  = chk('chkGrat') ? Math.max(0, n('valorGrat')) : 0;
  const valCom   = chk('chkCom')  ? Math.max(0, n('valorCom'))  : 0;
  const remBruta = salBase + valPeri + valGrat + valCom;

  // ── INSS empregado ──
  const inssEmp = calcINSS(remBruta);

  // ── IRRF 2026 ──
  const baseIRRF = Math.max(0, remBruta - inssEmp);
  const { impostoFinal: irrf, impostoBruto: irrfBruto, reducao: irrfReducao, categoria: irrfCat } = calcIRRF(baseIRRF);

  // ── FGTS ──
  const fgts = remBruta * CONFIG.fgts;

  // ── Encargos patronais ──
  const ratGrauNum = isP ? parseFloat(document.getElementById('ratGrau')?.value || '2') : 0;
  const fapNum     = isP ? Math.min(2, Math.max(0.5, parseFloat(document.getElementById('fap')?.value) || 1)) : 1;
  const ratPct     = (ratGrauNum / 100) * fapNum;
  const inssPatr   = isP ? remBruta * CONFIG.inss_patronal : 0;
  const rat        = isP ? remBruta * ratPct               : 0;
  const terceiros  = isP ? remBruta * CONFIG.terceiros      : 0;
  const totalEnc   = inssPatr + rat + terceiros;

  // ── Vale-transporte ──
  let vtBruto = 0, vtDescEmp = 0, vtCustoEmp = 0;
  if (chk('chkVT')) {
    vtBruto    = Math.max(0, n('valorPassagem')) * CONFIG.vt_passagens * CONFIG.vt_dias;
    vtDescEmp  = Math.min(salBase * CONFIG.vt_desc_pct, vtBruto);
    vtCustoEmp = vtBruto - vtDescEmp;
  }

  // ── Vale-alimentação ──
  const va = chk('chkVA') ? Math.max(0, n('valorDiaVA')) * CONFIG.va_dias : 0;

  // ── Custo mensal real (SEM provisões) ──
  const custoMensal = remBruta + fgts + inssPatr + rat + terceiros + vtCustoEmp + va;
  const custoHora   = custoMensal / CONFIG.horas_mes;

  // ── Líquido do trabalhador ──
  const liquidoFolha  = remBruta - inssEmp - vtDescEmp - irrf;
  const totalRecebido = liquidoFolha + vtBruto + va;

  // ── Provisões ──
  const prov13      = remBruta / 12;
  const provTerc    = remBruta / 12 / 3;       // 1/3 de férias (sem provisão de férias)
  const fgts13      = prov13   * CONFIG.fgts;  // FGTS sobre 13º
  const fgtsTerc    = provTerc * CONFIG.fgts;  // FGTS sobre 1/3 de férias
  const totalProv   = prov13 + provTerc + fgts13 + fgtsTerc;
  const custoComProv = custoMensal + totalProv;
  const horaComProv  = custoComProv / CONFIG.horas_mes;



  // ══ ATUALIZAR DOM ══

  // KPIs
  setText('kpi_remBruta', fmt(remBruta));
  setText('kpi_liquido',  fmt(liquidoFolha));
  setText('kpi_custo',    fmt(custoMensal));
  setText('kpi_hora',     fmt(custoHora));

  // Bloco A
  set('fa_salBase',  salBase);
  set('fa_peri',     valPeri);
  set('fa_grat',     valGrat);
  set('fa_com',      valCom);
  set('fa_remBruta', remBruta);
  set('fa_fgts',     fgts);
  set('fa_inssP',    inssPatr);
  set('fa_rat',      rat);
  set('fa_terc',     terceiros);
  set('fa_vtCusto',  vtCustoEmp);
  set('fa_va',       va);
  set('fa_total',    custoMensal);
  setText('bc_total',  fmt(custoMensal));
  setText('bc_hora',   fmt(custoHora));
  setText('fa_ratLbl', `(${ratGrauNum}% × ${fapNum.toFixed(4)})`);

  // Bloco B
  set('tb_salBase',  salBase);
  set('tb_peri',     valPeri);
  set('tb_grat',     valGrat);
  set('tb_com',      valCom);
  set('tb_remBruta', remBruta);
  set('tb_inss',     inssEmp);
  set('tb_desVT',    vtDescEmp);
  set('tb_irrf',     irrf);
  set('tb_liquido',  liquidoFolha);
  set('tb_vtBruto',  vtBruto);
  set('tb_va',       va);
  setText('tb_total', fmt(totalRecebido));

  // IRRF badge + info
  const badge = document.getElementById('irrf_badge');
  badge.className = `irrf-badge irrf-${irrfCat}`;
  const badgeTexts = { isento: '✓ Isento', reduzido: '↓ Reduzido', cheio: 'Tributado' };
  badge.textContent = badgeTexts[irrfCat];

  const infoEl = document.getElementById('irrf_info');
  if (irrfCat === 'isento') {
    infoEl.innerHTML = `<strong>IRRF:</strong> Isento — base de cálculo dentro da faixa de isenção até R$ 5.000.`;
  } else if (irrfCat === 'reduzido') {
    infoEl.innerHTML = `<strong>IRRF:</strong> Imposto bruto calculado: <strong>${fmt(irrfBruto)}</strong> · Redução (MP 1.294): <strong style="color:var(--green-dark)">−${fmt(irrfReducao)}</strong> · IRRF final: <strong style="color:var(--red)">${fmt(irrf)}</strong>`;
  } else {
    infoEl.innerHTML = `<strong>IRRF:</strong> Base de cálculo acima de R$ 7.350 — sem redução. IRRF calculado: <strong style="color:var(--red)">${fmt(irrf)}</strong>`;
  }

  // Bloco C — Provisões
  set('pv_13',      prov13);
  set('pv_terco',   provTerc);
  set('pv_fgts13',  fgts13);
  set('pv_fgtsTerc',fgtsTerc);
  set('pv_total',   totalProv);
  setText('pc_comProv',     fmt(custoComProv));
  setText('pc_horaComProv', fmt(horaComProv));

  // Destaque visual nos números-chave a cada recálculo
  ['kpi_remBruta','kpi_liquido','kpi_custo','kpi_hora','bc_total','bc_hora','tb_total','pc_comProv']
    .forEach(pulse);



  // Encargos bloco 1
  set('enc_inssP', inssPatr);
  set('enc_rat',   rat);
  set('enc_terc',  terceiros);
  set('enc_tot',   totalEnc);
  setText('enc_ratPct', `${ratGrauNum}% × ${fapNum.toFixed(4)}`);

  // Salvar para cópia
  window._sim = {
    regime, salBase, valPeri, valGrat, valCom, remBruta,
    inssEmp, irrf, irrfBruto, irrfReducao, irrfCat,
    vtDescEmp, vtBruto, va, liquidoFolha, totalRecebido,
    fgts, inssPatr, rat, terceiros, ratGrauNum, fapNum, vtCustoEmp,
    custoMensal, custoHora,
    prov13, provTerc, fgts13, fgtsTerc, totalProv, custoComProv, horaComProv,

  };
}

// ══════════════════════════════════════════════════════════════
//  SALVAR PDF
// ══════════════════════════════════════════════════════════════
function salvarPDF() {
  const s = window._sim || {};
  const regime = s.regime === 'presumido' ? 'Lucro Presumido' : 'Simples Nacional';
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const nomeArquivo = `Simulacao-CLT_${regime.replace(' ', '-')}_${dataHoje.replace(/\//g, '-')}.pdf`;

  // Preenche dados do cabeçalho
  document.getElementById('pdf-data').textContent   = 'Gerado em: ' + dataHoje;
  document.getElementById('pdf-regime').textContent = 'Regime: ' + regime;

  // Mostra o cabeçalho
  const header = document.getElementById('pdf-header');
  header.style.display = 'block';

  // Oculta elementos da página que não vão no PDF
  const ocultar = document.querySelectorAll(
'header, .hero, footer, .aviso, #toast, .glossario-section, #banner-atualizacao'
  );
  ocultar.forEach(el => el.style.display = 'none');

  // Monta wrapper com cabeçalho + coluna de resultados, em modo compacto
  const wrapper = document.createElement('div');
  wrapper.className = 'pdf-mode';
  wrapper.style.cssText = 'padding:10px; background:#f7f9fb;';

  const headerClone = header.cloneNode(true);
  const resultados  = document.querySelector('main > div:last-child').cloneNode(true);

  headerClone.style.display = 'block';
  wrapper.appendChild(headerClone);
  wrapper.appendChild(resultados);

  const opcoes = {
    margin:       [6, 6, 6, 6],
    filename:     nomeArquivo,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['css'] }
  };

  const btn = document.getElementById('btnSalvarPDF');
  btn?.classList.add('loading');
  btn?.setAttribute('disabled', 'true');

  html2pdf()
    .set(opcoes)
    .from(wrapper)
    .save()
    .then(() => {
      header.style.display = 'none';
      ocultar.forEach(el => el.style.display = '');
      showToast('PDF gerado com sucesso');
    })
    .catch(error => {
      console.error(error);
      header.style.display = 'none';
      ocultar.forEach(el => el.style.display = '');
      showToast('Erro ao gerar PDF — veja o console para detalhes');
    })
    .finally(() => {
      btn?.classList.remove('loading');
      btn?.removeAttribute('disabled');
    });
}

// ══════════════════════════════════════════════════════════════
//  IMPRIMIR
// ══════════════════════════════════════════════════════════════
function imprimir() {
  const s = window._sim || {};
  const regime = s.regime === 'presumido' ? 'Lucro Presumido' : 'Simples Nacional';
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  // Preenche dados do cabeçalho
  document.getElementById('pdf-data').textContent   = 'Gerado em: ' + dataHoje;
  document.getElementById('pdf-regime').textContent = 'Regime: ' + regime;

  // Mostra o cabeçalho
  const header = document.getElementById('pdf-header');
  header.style.display = 'block';

  // Oculta elementos que não devem aparecer na impressão
  const ocultar = document.querySelectorAll(
    'header, .hero, footer, .aviso, #toast, .glossario-section, #banner-atualizacao'
  );
  ocultar.forEach(el => el.style.display = 'none');

  // Aguarda renderizar e abre o diálogo de impressão
  setTimeout(() => {
    window.print();

    // Restaura após fechar o diálogo
    setTimeout(() => {
      header.style.display = 'none';
      ocultar.forEach(el => el.style.display = '');
    }, 1000);
  }, 300);
}

// ══════════════════════════════════════════════════════════════
//  LIMPAR
// ══════════════════════════════════════════════════════════════
function limpar() {
  document.querySelector('input[name="regime"][value="simples"]').checked = true;
  onRegime();
  document.getElementById('salarioBase').value   = '';
  ['chkPeri','chkVT','chkVA','chkGrat','chkCom'].forEach(id => { document.getElementById(id).checked = false; });
  [['chkPeri','sf-peri','tr-peri'],['chkVT','sf-vt','tr-vt'],['chkVA','sf-va','tr-va'],
   ['chkGrat','sf-grat','tr-grat'],['chkCom','sf-com','tr-com']]
    .forEach(([c,d,r]) => toggleSub(c,d,r));
  document.getElementById('percPeri').value = 30;
  document.getElementById('valorGrat').value = '';
  document.getElementById('valorCom').value  = '';
  document.getElementById('cnaeAtividade').value = '8211-3/00|2';
  document.getElementById('fap').value       = '1.0000';
  onCnaeChange();
  showToast('↺ Simulação limpa');
}

// ══════════════════════════════════════════════════════════════
//  GLOSSÁRIO — painel mestre-detalhe
// ══════════════════════════════════════════════════════════════
const GLOSSARIO = [
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
    lei: '📜 Lei nº 8.212/1991, Art. 20. Portaria MPS/MF nº 9/2025 — tabela de alíquotas progressivas 2025.' },
  { id: 'irrf', tag: 'Desconto Empregado', title: 'IRRF — Imposto de Renda Retido na Fonte',
    desc: 'Imposto sobre a renda do empregado, retido pela empresa e recolhido mensalmente. Calculado sobre a base de cálculo (remuneração bruta − INSS) de forma progressiva. Em 2026, rendimentos até R$ 5.000 são isentos pela MP 1.294/2024.',
    lei: '📜 Lei nº 7.713/1988; RIR/2018 (Decreto 9.580); MP nº 1.294/2024 — isenção até R$ 5.000 e redução até R$ 7.350.' },
  { id: 'fgts', tag: 'Encargo Empresa', title: 'FGTS — Fundo de Garantia por Tempo de Serviço',
    desc: 'Depósito mensal obrigatório de 8% sobre a remuneração bruta do empregado, realizado pela empresa em conta vinculada na Caixa Econômica Federal. O saldo pertence ao empregado e pode ser sacado em casos de demissão sem justa causa, aposentadoria, doenças graves, entre outros.',
    lei: '📜 Lei nº 8.036/1990, Art. 15 — "O empregador fica obrigado a depositar até o dia 7 de cada mês, em conta bancária vinculada, a importância correspondente a 8% da remuneração paga ou devida."' },
  { id: 'inss-patronal', tag: 'Encargo Empresa — Lucro Presumido', title: 'INSS Patronal',
    desc: 'Contribuição previdenciária de 20% sobre a folha de salários paga pela empresa ao INSS para financiamento da Previdência Social. Empresas do Simples Nacional têm esse encargo incluído na DAS.',
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
    desc: 'Todo empregado tem direito a 30 dias de férias remuneradas após cada período aquisitivo de 12 meses, acrescidas de 1/3 do salário. A provisão mensal de 1/12 de cada evita concentração de caixa no mês do gozo.',
    lei: '📜 CF/1988, Art. 7º, XVII; CLT, Arts. 129 a 153 — "Após cada período de 12 meses de vigência do contrato de trabalho, o empregado terá direito a férias... acrescido de, pelo menos, um terço a mais do que o salário normal."' },
];

function renderGlossario() {
  const list = document.getElementById('glosList');
  if (!list) return;
  list.innerHTML = GLOSSARIO.map((t, i) => `
    <button type="button" class="glos-item" data-id="${t.id}" role="option" aria-selected="${i === 0}">
      <span class="glos-item-tag">${t.tag}</span>
      <span class="glos-item-title">${t.title}</span>
    </button>
  `).join('');
  list.querySelectorAll('.glos-item').forEach(btn => {
    btn.addEventListener('click', () => selectGlos(btn.dataset.id));
  });
  selectGlos(GLOSSARIO[0].id);
}

function selectGlos(id) {
  const term = GLOSSARIO.find(t => t.id === id);
  if (!term) return;
  document.querySelectorAll('.glos-item').forEach(el => {
    el.setAttribute('aria-selected', el.dataset.id === id ? 'true' : 'false');
  });
  const detail = document.getElementById('glosDetail');
  if (!detail) return;
  detail.innerHTML = `
    <span class="glos-detail-tag">${term.tag}</span>
    <h3 class="glos-detail-title">${term.title}</h3>
    <p class="glos-detail-desc">${term.desc}</p>
    <div class="glos-detail-lei">${term.lei}</div>
  `;
}

// ══════════════════════════════════════════════════════════════
//  TEMA CLARO / ESCURO
// ══════════════════════════════════════════════════════════════
function toggleTheme() {
  const atual = document.documentElement.getAttribute('data-theme');
  const novo  = atual === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', novo);
  localStorage.setItem('clt-theme', novo);
}
// ══════════════════════════════════════════════════════════════
//  VERIFICAÇÃO DE TABELAS ATUALIZADAS
// ══════════════════════════════════════════════════════════════
function verificarAtualizacao() {
  const anoAtual   = new Date().getFullYear();
  const anoTabelas = CONFIG.ano_tabelas;

  if (anoAtual > anoTabelas) {
    const banner = document.getElementById('banner-atualizacao');
    if (banner) {
      banner.style.display = 'flex';
      banner.querySelector('.banner-ano').textContent =
        `As tabelas de INSS e IRRF são de ${anoTabelas}. Verifique se há atualização para ${anoAtual}.`;
    }
  }
}
// init
onRegime();
onCnaeChange();
renderGlossario();
verificarAtualizacao();
// Set print date on load
const pdEl = document.getElementById('print-date');
if (pdEl) pdEl.textContent = 'Gerado em: ' + new Date().toLocaleDateString('pt-BR');