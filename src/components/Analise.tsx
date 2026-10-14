import { useState } from 'react';
import { cenarioAtual, composicaoCusto, type Cenario, type SegmentoId } from '../domain/analise';
import { brl } from '../domain/format';
import type { ResultadoSimulacao } from '../domain/types';
import { Card } from './ui';

const pctFmt = (v: number) =>
  `${(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/** Barra empilhada: parte-do-todo com 5 categorias, rótulos e valores sempre visíveis. */
export function ComposicaoCusto({ r }: { r: ResultadoSimulacao }) {
  const [ativo, setAtivo] = useState<SegmentoId | null>(null);
  const todos = composicaoCusto(r);
  const total = todos.reduce((s, x) => s + x.valor, 0);
  const visiveis = todos.filter((x) => x.valor > 0);

  return (
    <Card icon="pie" tom="accent" title="Para onde vai o custo">
      {total <= 0 ? (
        <p className="hint">Informe o salário base para ver a composição.</p>
      ) : (
        <div className="viz">
          <div className="stack" role="img"
            aria-label={`Composição do custo total de ${brl(total)}: ${visiveis.map((s) => `${s.label} ${pctFmt(s.valor / total)}`).join(', ')}`}>
            {visiveis.map((s) => (
              <button key={s.id} type="button" className={`stack-seg s-${s.id}`}
                style={{ flexGrow: s.valor, flexBasis: 0 }}
                aria-label={`${s.label}: ${brl(s.valor)} (${pctFmt(s.valor / total)})`}
                onMouseEnter={() => setAtivo(s.id)} onMouseLeave={() => setAtivo(null)}
                onFocus={() => setAtivo(s.id)} onBlur={() => setAtivo(null)} />
            ))}
          </div>
          <ul className="legend">
            {visiveis.map((s) => (
              <li key={s.id} className={ativo === s.id ? 'on' : ''}
                onMouseEnter={() => setAtivo(s.id)} onMouseLeave={() => setAtivo(null)}>
                <span className={`sw s-${s.id}`} />
                <span className="nm">{s.label}</span>
                <span className="vl">{brl(s.valor)}</span>
                <span className="pc">{pctFmt(s.valor / total)}</span>
              </li>
            ))}
          </ul>
          <p className="hint" style={{ marginTop: 10 }}>
            Total de {brl(total)} por mês, incluindo as provisões de 13º e 1/3 de férias.
          </p>
        </div>
      )}
    </Card>
  );
}

/** Mesma remuneração nos três enquadramentos; o regime selecionado fica destacado. */
export function ComparativoRegimes({ r, cenarios }: { r: ResultadoSimulacao; cenarios: Cenario[] }) {
  const atual = cenarioAtual(r);
  const maior = Math.max(...cenarios.map((c) => c.custoMensal), 0);
  const base = cenarios.find((c) => c.id === atual)?.custoMensal ?? 0;

  return (
    <Card icon="scale" tom="purple" title="Comparativo de regimes">
      {maior <= 0 ? (
        <p className="hint">Informe o salário base para comparar os regimes.</p>
      ) : (
        <div className="cmp">
          {cenarios.map((c) => {
            const dif = c.custoMensal - base;
            return (
              <div key={c.id} className={`cmp-row${c.id === atual ? ' atual' : ''}`}>
                <span className="cmp-name">
                  {c.label}
                  {c.id === atual && <span className="cmp-tag">Selecionado</span>}
                </span>
                <span className="cmp-val">{brl(c.custoMensal)}</span>
                <span className="cmp-bar" aria-hidden="true">
                  <i style={{ width: `${(c.custoMensal / maior) * 100}%` }} />
                </span>
                <span className="cmp-meta">
                  <span>Encargos patronais: {brl(c.encargosPatronais)}</span>
                  <span>
                    {c.id === atual
                      ? 'Referência'
                      : `${dif > 0 ? '+' : '−'}${brl(Math.abs(dif))} vs. selecionado`}
                  </span>
                </span>
              </div>
            );
          })}
          <p className="hint">Custo mensal da empresa, sem provisões. Mesmos dados do formulário em cada regime.</p>
        </div>
      )}
    </Card>
  );
}
