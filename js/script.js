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
};

// ══════════════════════════════════════════════════════════════
//  UTILITÁRIOS
// ══════════════════════════════════════════════════════════════
const fmt  = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const n    = id => parseFloat(document.getElementById(id)?.value) || 0;
const chk  = id => document.getElementById(id)?.checked ?? false;
function set(id, val)     { const e = document.getElementById(id); if (e) e.textContent = fmt(val); }
function setText(id, txt) { const e = document.getElementById(id); if (e) e.textContent = txt; }
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
  const remBruta = salBase + valPeri;

  // ── INSS empregado ──
  const inssEmp = calcINSS(remBruta);

  // ── IRRF 2026 ──
  const baseIRRF = Math.max(0, remBruta - inssEmp);
  const { impostoFinal: irrf, impostoBruto: irrfBruto, reducao: irrfReducao, categoria: irrfCat } = calcIRRF(baseIRRF);

  // ── FGTS ──
  const fgts = remBruta * CONFIG.fgts;

  // ── Encargos patronais ──
  const ratNum   = isP ? parseFloat(document.getElementById('ratFap')?.value || '2') : 0;
  const ratPct   = ratNum / 100;
  const inssPatr = isP ? remBruta * CONFIG.inss_patronal : 0;
  const rat      = isP ? remBruta * ratPct               : 0;
  const terceiros= isP ? remBruta * CONFIG.terceiros      : 0;
  const totalEnc = inssPatr + rat + terceiros;

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
  setText('fa_ratLbl', `(${ratNum}%)`);

  // Bloco B
  set('tb_salBase',  salBase);
  set('tb_peri',     valPeri);
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



  // Encargos bloco 1
  set('enc_inssP', inssPatr);
  set('enc_rat',   rat);
  set('enc_terc',  terceiros);
  set('enc_tot',   totalEnc);
  setText('enc_ratPct', `${ratNum}%`);

  // Salvar para cópia
  window._sim = {
    regime, salBase, valPeri, remBruta,
    inssEmp, irrf, irrfBruto, irrfReducao, irrfCat,
    vtDescEmp, vtBruto, va, liquidoFolha, totalRecebido,
    fgts, inssPatr, rat, terceiros, ratNum, vtCustoEmp,
    custoMensal, custoHora,
    prov13, provTerc, fgts13, fgtsTerc, totalProv, custoComProv, horaComProv,

  };
}

// ══════════════════════════════════════════════════════════════
//  SALVAR PDF
// ══════════════════════════════════════════════════════════════
function salvarPDF() {
  // Atualiza data no header de impressão
  const dateEl = document.getElementById('print-date');
  if (dateEl) {
    const s = window._sim || {};
    const reg = s.regime === 'presumido' ? 'Lucro Presumido' : 'Simples Nacional';
    dateEl.innerHTML = `Gerado em: ${new Date().toLocaleDateString('pt-BR')}<br>Regime: ${reg}`;
  }
  // Mostra print header e aviso durante impressão
  document.querySelectorAll('.print-header,.print-aviso').forEach(el => el.style.display = '');
  // Abre diálogo de impressão configurado para PDF
  const original = document.title;
  document.title = 'Simulação CLT — Êxito Contábil — ' + new Date().toLocaleDateString('pt-BR');
  window.print();
  document.title = original;
  // Restaura após impressão
  setTimeout(() => {
    document.querySelectorAll('.print-header,.print-aviso').forEach(el => el.style.display = 'none');
  }, 1000);
}

// ══════════════════════════════════════════════════════════════
//  IMPRIMIR
// ══════════════════════════════════════════════════════════════
function imprimir() {
  salvarPDF(); // mesma função — o navegador permite escolher impressora ou PDF
}

// ══════════════════════════════════════════════════════════════
//  LIMPAR
// ══════════════════════════════════════════════════════════════
function limpar() {
  document.querySelector('input[name="regime"][value="simples"]').checked = true;
  onRegime();
  document.getElementById('salarioBase').value   = '';
  ['chkPeri','chkVT','chkVA'].forEach(id => { document.getElementById(id).checked = false; });
  [['chkPeri','sf-peri','tr-peri'],['chkVT','sf-vt','tr-vt'],['chkVA','sf-va','tr-va']]
    .forEach(([c,d,r]) => toggleSub(c,d,r));
  document.getElementById('percPeri').value = 30;
  document.getElementById('ratFap').value   = '2.0';
  calcular();
  showToast('↺ Simulação limpa');
}

// ══════════════════════════════════════════════════════════════
//  TOGGLE GLOSSÁRIO ACCORDION
// ══════════════════════════════════════════════════════════════
function toggleGlos(trigger) {
  const card = trigger.closest('.glos-card');
  const isOpen = card.classList.contains('open');
  // Close all others
  document.querySelectorAll('.glos-card.open').forEach(c => c.classList.remove('open'));
  // Toggle current
  if (!isOpen) card.classList.add('open');
}

// init
onRegime();
calcular();
// Set print date on load
const pdEl = document.getElementById('print-date');
if (pdEl) pdEl.textContent = 'Gerado em: ' + new Date().toLocaleDateString('pt-BR');