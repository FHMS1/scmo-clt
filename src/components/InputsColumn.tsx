import type { ReactNode } from 'react';
import { CNAES, CNAE_OUTRA, ROTULO_GRAU } from '../domain/cnae';
import { grauDoFormulario, type FormState } from '../domain/formulario';
import { brl } from '../domain/format';
import { TABELAS } from '../domain/tabelas2026';
import type { GrauRisco, ResultadoSimulacao } from '../domain/types';
import { Card } from './ui';

type Props = {
  form: FormState;
  onChange: <K extends keyof FormState>(campo: K, valor: FormState[K]) => void;
  resultado: ResultadoSimulacao;
};

const GRAUS: GrauRisco[] = [1, 2, 3];
const pct = (v: number) => `${(v * 100).toString().replace('.', ',')}%`;

function Toggle({
  icon, label, checked, onToggle, children,
}: { icon: string; label: string; checked: boolean; onToggle: (v: boolean) => void; children: ReactNode }) {
  return (
    <>
      <div className={`toggle-row${checked ? ' on' : ''}`}>
        <div className="toggle-lbl"><span>{icon}</span> {label}</div>
        <label className="tsw">
          <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} aria-label={label} />
          <span className="tsl" />
        </label>
      </div>
      {checked && <div className="sub-fields" style={{ display: 'block' }}>{children}</div>}
    </>
  );
}

function CampoMoeda({
  label, value, onChange, hint,
}: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="fg">
      <label>{label}</label>
      <div className="pfx-wrap">
        <span className="pfx">R$</span>
        <input type="number" min={0} step={0.01} placeholder="0,00" value={value}
          onChange={(e) => onChange(e.target.value)} />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function BlocoRegime({ form, onChange, resultado }: Props) {
  const presumido = form.regime === 'presumido';
  const patronal = resultado.patronalAplica;
  const outra = form.cnae === CNAE_OUTRA;
  const grau = grauDoFormulario(form);
  const cnae = CNAES.find((c) => c.codigo === form.cnae);

  return (
    <Card icon="🏛️" iconClass="ci-purple" title="Regime Tributário da Empresa" badge="BLOCO 1">
      <div className="regime-pills">
        <label className={`rpill${form.regime === 'simples' ? ' sel-simples' : ''}`}>
          <input type="radio" name="regime" checked={form.regime === 'simples'}
            onChange={() => onChange('regime', 'simples')} />
          Simples Nacional
        </label>
        <label className={`rpill${presumido ? ' sel-presumido' : ''}`}>
          <input type="radio" name="regime" checked={presumido}
            onChange={() => onChange('regime', 'presumido')} />
          Lucro Presumido
        </label>
      </div>

      {form.regime === 'simples' && (
        <label className="toggle-lbl" style={{ marginTop: 14, gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.anexoIV} onChange={(e) => onChange('anexoIV', e.target.checked)} />
          Atividade do Anexo IV (CPP e RAT fora do DAS)
        </label>
      )}

      {patronal && (
        <div style={{ marginTop: 16 }}>
          <div className="slbl">Encargos Patronais</div>

          <div className="fg">
            <label htmlFor="cnae">Atividade (CNAE)</label>
            <select id="cnae" value={form.cnae} onChange={(e) => onChange('cnae', e.target.value)}>
              {GRAUS.map((g) => (
                <optgroup key={g} label={ROTULO_GRAU[g]}>
                  {CNAES.filter((c) => c.grau === g).map((c) => (
                    <option key={c.codigo} value={c.codigo}>{c.descricao}</option>
                  ))}
                </optgroup>
              ))}
              <option value={CNAE_OUTRA}>Outra atividade / CNAE não listado</option>
            </select>
            <p className="hint">
              {outra
                ? '⚠️ Selecione o grau de risco manualmente e confirme no Anexo V do Decreto nº 3.048/1999 (ou no CNAE oficial do cliente).'
                : `📌 CNAE ${cnae?.codigo} · grau de risco ${grau} (${grau}%). Lista curada — fora dela, use "Outra atividade".`}
            </p>
          </div>

          {outra && (
            <div className="fg">
              <label htmlFor="grau">Grau de risco manual</label>
              <select id="grau" value={form.grauManual}
                onChange={(e) => onChange('grauManual', Number(e.target.value) as GrauRisco)}>
                {GRAUS.map((g) => <option key={g} value={g}>{ROTULO_GRAU[g]}</option>)}
              </select>
              <p className="hint">⚠️ Confirme o grau oficial do CNAE do cliente no Anexo V do Decreto nº 3.048/1999 antes de usar.</p>
            </div>
          )}

          <div className="fg">
            <label htmlFor="fap">FAP — Fator Acidentário de Prevenção</label>
            <div className="pfx-wrap">
              <span className="pfx">×</span>
              <input id="fap" type="number" min={0.5} max={2} step={0.0001} value={form.fap}
                onChange={(e) => onChange('fap', e.target.value)} />
            </div>
            <p className="hint">⚙️ Multiplica o RAT de 0,5000 a 2,0000 conforme o histórico de acidentes da empresa. Use o valor homologado no CNPJ (extrato FAP no gov.br).</p>
          </div>

          <div className="enc-box">
            <div className="enc-row"><span className="enc-lbl">INSS Patronal</span><span className="enc-aliq">{pct(TABELAS.inssPatronal)}</span><span className="enc-val">{brl(resultado.inssPatronal)}</span></div>
            <div className="enc-row"><span className="enc-lbl">RAT × FAP</span><span className="enc-aliq">{resultado.grauRisco}% × {resultado.fap.toFixed(4).replace('.', ',')}</span><span className="enc-val">{brl(resultado.rat)}</span></div>
            {presumido && (
              <div className="enc-row"><span className="enc-lbl">Terceiros — Sistema S</span><span className="enc-aliq">{pct(TABELAS.terceiros)}</span><span className="enc-val">{brl(resultado.terceiros)}</span></div>
            )}
            <div className="enc-row enc-total-row"><span className="enc-lbl">Total encargos patronais</span><span /><span className="enc-val">{brl(resultado.totalEncargosPatronais)}</span></div>
          </div>
        </div>
      )}
    </Card>
  );
}

function BlocoEmpregado({ form, onChange }: Props) {
  return (
    <Card icon="⌗" iconClass="ci-teal" title="Dados do Empregado" badge="BLOCO 2">
      <CampoMoeda label="Salário base mensal" value={form.salarioBase}
        onChange={(v) => onChange('salarioBase', v)} />

      <Toggle icon="⚠️" label="Adicional de periculosidade" checked={form.chkPeri}
        onToggle={(v) => onChange('chkPeri', v)}>
        <div className="fg">
          <label>Percentual</label>
          <div className="sfx-wrap">
            <span className="sfx">%</span>
            <input type="number" min={0} max={100} step={0.1} value={form.percPeri}
              onChange={(e) => onChange('percPeri', e.target.value)} />
          </div>
          <p className="hint">Padrão CLT: 30% sobre o salário base</p>
        </div>
      </Toggle>

      <Toggle icon="🏅" label="Gratificação" checked={form.chkGrat}
        onToggle={(v) => onChange('chkGrat', v)}>
        <CampoMoeda label="Valor mensal" value={form.valorGrat}
          onChange={(v) => onChange('valorGrat', v)}
          hint="📌 Gratificação habitual integra a remuneração (CLT, Art. 457) — entra na base de INSS, IRRF, FGTS e provisões." />
      </Toggle>

      <Toggle icon="📈" label="Comissão" checked={form.chkCom}
        onToggle={(v) => onChange('chkCom', v)}>
        <CampoMoeda label="Valor mensal" value={form.valorCom}
          onChange={(v) => onChange('valorCom', v)}
          hint="📌 Comissão integra a remuneração (Lei nº 3.207/1957) — entra na base de INSS, IRRF, FGTS e provisões." />
      </Toggle>

      <Toggle icon="🚌" label="Vale-transporte" checked={form.chkVT}
        onToggle={(v) => onChange('chkVT', v)}>
        <CampoMoeda label="Valor de 1 passagem" value={form.valorPassagem}
          onChange={(v) => onChange('valorPassagem', v)}
          hint={`📌 Calculado: ${TABELAS.vtPassagens} passagens/dia × ${TABELAS.vtDias} dias úteis`} />
      </Toggle>

      <Toggle icon="🍽️" label="Vale-alimentação / refeição" checked={form.chkVA}
        onToggle={(v) => onChange('chkVA', v)}>
        <CampoMoeda label="Valor por dia útil" value={form.valorDiaVA}
          onChange={(v) => onChange('valorDiaVA', v)}
          hint={`📌 ${TABELAS.vaDias} dias úteis/mês · custo integral da empresa`} />
      </Toggle>
    </Card>
  );
}

function faixaLabel(i: number) {
  const f = TABELAS.irrfFaixas;
  const fmt = (v: number) => brl(v);
  if (i === 0) return `Até ${fmt(f[0].teto)}`;
  if (i === f.length - 1) return `Acima de ${fmt(f[i - 1].teto)}`;
  return `${fmt(f[i - 1].teto + 0.01)} — ${fmt(f[i].teto)}`;
}

function BlocoIrrf() {
  const cores = ['free', '', '', 'amber', 'red'];
  return (
    <Card icon="📋" iconClass="ci-red" title={`Tabela IRRF ${TABELAS.anoTabelas}`}>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 10 }}>
        Base de cálculo = remuneração bruta − a maior entre o INSS e o desconto simplificado ({brl(TABELAS.irrfDescontoSimplificado)}). A redução abaixo é apurada sobre a remuneração bruta.
      </p>
      <table className="irrf-table">
        <thead>
          <tr><th style={{ textAlign: 'left' }}>Base de cálculo</th><th>Alíquota</th><th style={{ textAlign: 'right' }}>Dedução</th></tr>
        </thead>
        <tbody>
          {TABELAS.irrfFaixas.map((f, i) => (
            <tr key={i}>
              <td>{faixaLabel(i)}</td>
              <td className={`aliq ${cores[i] ?? ''}`.trim()}>
                {f.aliq === 0 ? <span className="aliq free">Isento</span> : pct(f.aliq)}
              </td>
              <td className="num">{f.ded === 0 ? '—' : brl(f.ded)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="irrf-note">
        <strong>Redução do IRRF (Lei 15.270/2025) — sobre a remuneração bruta:</strong><br />
        • Até {brl(TABELAS.irrfIsencaoTeto)} → imposto zerado (redução de até {brl(TABELAS.irrfDescontoMax)})<br />
        • {brl(TABELAS.irrfIsencaoTeto + 0.01)} a {brl(TABELAS.irrfReducaoTeto)} → redução = {brl(TABELAS.irrfReducaoConstante)} − ({TABELAS.irrfReducaoFator.toString().replace('.', ',')} × bruto)<br />
        • Acima de {brl(TABELAS.irrfReducaoTeto + 0.01)} → sem redução adicional
      </div>
    </Card>
  );
}

export function InputsColumn(props: Props) {
  return (
    <div>
      <BlocoRegime {...props} />
      <BlocoEmpregado {...props} />
      <BlocoIrrf />
    </div>
  );
}
