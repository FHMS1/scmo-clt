import { forwardRef } from 'react';
import { TABELAS } from '../domain/tabelas2026';
import { dataHoje } from '../services/exportar';

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' } as const;

export function Header() {
  return (
    <header>
      <div className="header-inner">
        <span className="header-title">Simulador CLT</span>
        <span className="header-tag">Simulador de Custo CLT · {TABELAS.anoTabelas}</span>
      </div>
    </header>
  );
}

export function BannerAtualizacao() {
  const anoAtual = new Date().getFullYear();
  if (anoAtual <= TABELAS.anoTabelas) return null;
  return (
    <div className="banner-atualizacao" role="alert">
      <span>⚠️</span>
      <span>As tabelas de INSS e IRRF são de {TABELAS.anoTabelas}. Verifique se há atualização para {anoAtual}.</span>
      <a href="https://www.gov.br/receitafederal" target="_blank" rel="noreferrer">Verificar tabelas →</a>
    </div>
  );
}

type HeroProps = {
  gerandoPdf: boolean;
  onLimpar: () => void;
  onPdf: () => void;
  onImprimir: () => void;
  onTema: () => void;
};

export function Hero({ gerandoPdf, onLimpar, onPdf, onImprimir, onTema }: HeroProps) {
  return (
    <div className="hero">
      <span className="hero-eyebrow">Planilha de demonstração</span>
      <h1>Simulador de Custo de Mão de Obra CLT</h1>
      <p>Custo mensal real · Líquido do trabalhador · IRRF {TABELAS.anoTabelas} · Provisões · Encargos patronais por regime tributário</p>
      <div className="hero-actions">
        <button className="icon-btn" onClick={onLimpar} title="Limpar simulação" aria-label="Limpar simulação">
          <svg {...ico}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
          <span className="btn-tooltip">Limpar</span>
        </button>
        <button className={`icon-btn${gerandoPdf ? ' loading' : ''}`} onClick={onPdf} disabled={gerandoPdf}
          title="Salvar como PDF" aria-label="Salvar como PDF">
          <svg className="icon-default" {...ico}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          <svg className="icon-spin" {...ico}><path d="M21 12a9 9 0 1 1-9-9" /></svg>
          <span className="btn-tooltip">Salvar PDF</span>
        </button>
        <button className="icon-btn" onClick={onImprimir} title="Imprimir" aria-label="Imprimir">
          <svg {...ico}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          <span className="btn-tooltip">Imprimir</span>
        </button>
        <button className="icon-btn icon-theme" onClick={onTema} title="Alternar tema" aria-label="Alternar tema claro/escuro">
          <svg className="icon-sun" {...ico}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
          <svg className="icon-moon" {...ico}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          <span className="btn-tooltip">Tema</span>
        </button>
      </div>
    </div>
  );
}

/** Cabeçalho do PDF/impressão — oculto na tela (ver .pdf-header em react.css). */
export const PdfHeader = forwardRef<HTMLDivElement, { regime: string }>(function PdfHeader({ regime }, ref) {
  return (
    <div ref={ref} className="pdf-header" id="pdf-header">
      <div className="pdf-header-row">
        <div className="pdf-header-left">
          <div>
            <div className="pdf-header-title">Simulador de Custo de Mão de Obra CLT</div>
            <div className="pdf-header-sub">Uso exclusivo para estimativa</div>
          </div>
        </div>
        <div className="pdf-header-meta">
          <div>Gerado em: {dataHoje()}</div>
          <div>Regime: {regime}</div>
        </div>
      </div>
    </div>
  );
});

export function Footer() {
  return (
    <footer>
      <strong>Simulador CLT</strong> v5.1<br />
      Tabela INSS {TABELAS.anoTabelas} · Tabela IRRF {TABELAS.anoTabelas} · Redução do IRRF até R$ 7.350 (Lei 15.270/2025) · Simples Nacional e Lucro Presumido · Uso exclusivo para estimativa
    </footer>
  );
}
