import { forwardRef } from 'react';
import { brl, pct } from '../domain/format';
import { TABELAS } from '../domain/tabelas2026';
import type { ResultadoSimulacao } from '../domain/types';
import type { Cenario } from '../domain/analise';
import { ComparativoRegimes, ComposicaoCusto } from './Analise';
import { Card, Icon, Linha, Valor, type IconName } from './ui';

const H = TABELAS.horasMes;

function Kpis({ r }: { r: ResultadoSimulacao }) {
  const mult = r.remuneracaoBruta > 0 ? r.custoMensal / r.remuneracaoBruta : 0;
  const liqPct = r.remuneracaoBruta > 0 ? r.liquidoFolha / r.remuneracaoBruta : 0;
  const fmt1 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const itens: { cls: string; icon: IconName; label: string; valor: number; sub: string }[] = [
    { cls: 'k-teal', icon: 'wallet', label: 'Remuneração bruta', valor: r.remuneracaoBruta, sub: 'Antes dos descontos' },
    { cls: 'k-green', icon: 'user', label: 'Líquido em folha', valor: r.liquidoFolha,
      sub: r.remuneracaoBruta > 0 ? `${(liqPct * 100).toFixed(1).replace('.', ',')}% da remuneração bruta` : 'Após INSS, IRRF e VT' },
    { cls: 'k-amber', icon: 'coins', label: 'Custo mensal da empresa', valor: r.custoMensal,
      sub: mult > 0 ? `${fmt1(mult)}× a remuneração bruta` : 'Sem provisões' },
    { cls: 'k-red', icon: 'clock', label: `Custo por hora (÷ ${H}h)`, valor: r.custoHora, sub: 'Sem provisões' },
  ];
  return (
    <div className="kpi-grid">
      {itens.map((k) => (
        <div key={k.label} className={`kpi ${k.cls}`}>
          <div className="kpi-top">
            <span className="kpi-ico"><Icon name={k.icon} /></span>
            <span className="kpi-lbl">{k.label}</span>
          </div>
          <div className="kpi-val"><Valor value={k.valor} /></div>
          <div className="kpi-sub">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

function FolhaAPagar({ r }: { r: ResultadoSimulacao }) {
  const presumido = r.regime === 'presumido';
  return (
    <Card icon="wallet" title="Custo mensal real — folha a pagar">
      <div className="slbl">Remuneração</div>
      <Linha label="Salário base" value={r.salarioBase} />
      <Linha label="Adicional de periculosidade" value={r.valorPericulosidade} />
      <Linha label="Gratificação" value={r.valorGratificacao} />
      <Linha label="Comissão" value={r.valorComissao} />
      <Linha label="Remuneração bruta" value={r.remuneracaoBruta} destaque />
      <hr className="dv" />
      <div className="slbl">Encargos sociais sobre a folha</div>
      <Linha label={`FGTS (${pct(TABELAS.fgts)})`} value={r.fgts} />
      {r.patronalAplica && (
        <>
          <Linha label={`INSS Patronal (${pct(TABELAS.inssPatronal)})`} value={r.inssPatronal} />
          <Linha
            label={<>RAT/FAP <span className="rv-dim">({r.grauRisco}% × {r.fap.toFixed(4).replace('.', ',')})</span></>}
            value={r.rat}
          />
          {presumido && <Linha label={`Terceiros — Sistema S (${pct(TABELAS.terceiros)})`} value={r.terceiros} />}
        </>
      )}
      <hr className="dv" />
      <div className="slbl">Benefícios</div>
      <Linha label="Vale-transporte (custo líquido empresa)" value={r.vtCustoEmpresa} />
      <Linha label="Vale-alimentação / refeição" value={r.va} />
      <div className="total-band">
        <span className="rl">Custo mensal total da empresa</span>
        <span className="rv"><Valor value={r.custoMensal} /></span>
      </div>
      <div className="big-teal">
        <div className="bc-lbl">Desembolso mensal real</div>
        <div className="bc-val"><Valor value={r.custoMensal} /></div>
        <div className="bc-sub">Custo/hora (÷ {H}h): <strong><Valor value={r.custoHora} /></strong></div>
      </div>
    </Card>
  );
}

const BADGE = { isento: '✓ Isento', reduzido: '↓ Reduzido', cheio: 'Tributado' } as const;

function InfoIrrf({ r }: { r: ResultadoSimulacao }) {
  const { categoria, impostoBruto, reducao, impostoFinal, deducao, deducaoTipo, baseCalculo } = r.irrf;
  const ded = <>Base {brl(baseCalculo)} (bruto − {deducaoTipo === 'simplificado' ? 'desconto simplificado' : 'INSS'} {brl(deducao)}). </>;
  if (categoria === 'isento')
    return <><strong>IRRF:</strong> {r.remuneracaoBruta > 0 && ded}Isento — redução zera o imposto (rendimento bruto até {brl(TABELAS.irrfIsencaoTeto)}) ou imposto da tabela é zero.</>;
  if (categoria === 'reduzido')
    return (
      <>
        <strong>IRRF:</strong> {ded}Imposto da tabela: <strong>{brl(impostoBruto)}</strong> · Redução (Lei 15.270):{' '}
        <strong className="irrf-green">−{brl(reducao)}</strong> · IRRF final:{' '}
        <strong className="irrf-red">{brl(impostoFinal)}</strong>
      </>
    );
  return (
    <>
      <strong>IRRF:</strong> {ded}Rendimento bruto acima de {brl(TABELAS.irrfReducaoTeto)} — sem redução. IRRF calculado:{' '}
      <strong className="irrf-red">{brl(impostoFinal)}</strong>
    </>
  );
}

function Trabalhador({ r }: { r: ResultadoSimulacao }) {
  return (
    <Card icon="user" tom="green" title="O que o trabalhador recebe">
      <div className="slbl">Composição da remuneração</div>
      <Linha label="Salário base" value={r.salarioBase} />
      <Linha label="Adicional de periculosidade" value={r.valorPericulosidade} />
      <Linha label="Gratificação" value={r.valorGratificacao} />
      <Linha label="Comissão" value={r.valorComissao} />
      <Linha label="Remuneração bruta" value={r.remuneracaoBruta} destaque />
      <hr className="dv" />
      <div className="slbl">Descontos em folha</div>
      <Linha label="(−) INSS do empregado" value={r.inssEmpregado} tom="red" />
      <Linha label={`(−) Desconto vale-transporte (${pct(TABELAS.vtDescPct)} s/ sal. base)`} value={r.descontoVT} tom="red" />
      <Linha
        label={<>(−) IRRF estimado <span className={`irrf-badge irrf-${r.irrf.categoria}`}>{BADGE[r.irrf.categoria]}</span></>}
        value={r.irrf.impostoFinal}
        tom="red"
      />
      <div className="total-band">
        <span className="rl">Líquido estimado em folha</span>
        <span className="rv"><Valor value={r.liquidoFolha} /></span>
      </div>
      <div className="irrf-info"><InfoIrrf r={r} /></div>
      <hr className="dv" style={{ marginTop: 12 }} />
      <div className="slbl">Benefícios recebidos fora da folha</div>
      <Linha label="Vale-transporte (valor integral do benefício)" value={r.vtBruto} tom="grn" />
      <Linha label="Vale-alimentação / refeição" value={r.va} tom="grn" />
      <div className="green-band">
        <span className="rl">Total recebido (folha + benefícios)</span>
        <span className="rv"><Valor value={r.totalRecebido} /></span>
      </div>
    </Card>
  );
}

function Provisoes({ r }: { r: ResultadoSimulacao }) {
  return (
    <Card icon="calendar" tom="amber" title="Provisões — programação financeira">
      <div className="note-box">
        Valores <strong>não incluídos</strong> no custo mensal acima. Representam obrigações futuras que devem ser provisionadas mensalmente.
      </div>
      <div className="slbl">Provisões mensais obrigatórias</div>
      <Linha label="Provisão 13º salário (rem. bruta ÷ 12)" value={r.prov13} />
      <Linha label={`FGTS sobre 13º (${pct(TABELAS.fgts)} × prov. 13º)`} value={r.fgtsSobre13} />
      <Linha label="Provisão 1/3 de férias (rem. bruta ÷ 12 ÷ 3)" value={r.provTercoFerias} />
      <Linha label={`FGTS sobre 1/3 de férias (${pct(TABELAS.fgts)} × prov. 1/3)`} value={r.fgtsSobreTerco} />
      <div className="prov-band">
        <span className="rl">Total provisionado / mês</span>
        <span className="rv"><Valor value={r.totalProvisoes} /></span>
      </div>
      <div className="big-amber">
        <div className="bc-lbl">Custo total incluindo provisões mensais</div>
        <div className="bc-val"><Valor value={r.custoComProvisoes} /></div>
        <div className="bc-sub">Custo/hora real (com provisões, ÷ {H}h): <strong><Valor value={r.horaComProvisoes} /></strong></div>
      </div>
    </Card>
  );
}

/** Coluna de resultados. O ref é usado pelo exportador de PDF. */
export const ResultsColumn = forwardRef<HTMLDivElement, { resultado: ResultadoSimulacao; cenarios: Cenario[] }>(
  function ResultsColumn({ resultado: r, cenarios }, ref) {
    return (
      <div ref={ref} className="col">
        {r.remuneracaoBruta <= 0 && (
          <div className="empty-state">
            <Icon name="form" />
            <div>
              <strong>Informe o salário base para começar</strong>
              <span>Os valores abaixo são recalculados a cada alteração no formulário.</span>
            </div>
          </div>
        )}
        <Kpis r={r} />
        <ComposicaoCusto r={r} />
        <FolhaAPagar r={r} />
        <Trabalhador r={r} />
        <Provisoes r={r} />
        <ComparativoRegimes r={r} cenarios={cenarios} />
        <div className="aviso">
          <Icon name="info" />
          <p>
            Esta simulação é <strong>estimativa</strong>. O IRRF pode variar conforme deduções legais (dependentes, pensão,
            previdência privada). Não considera horas extras, faltas, convenção coletiva e outros eventos variáveis da folha de pagamento.
          </p>
        </div>
      </div>
    );
  },
);
