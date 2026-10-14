import { forwardRef, type ReactNode } from 'react';
import { TABELAS } from '../domain/tabelas2026';
import { dataHoje } from '../services/exportar';
import { Icon } from './ui';

export function Header() {
  return (
    <header>
      <div className="header-inner">
        <span className="header-title">Simulador CLT</span>
        <span className="header-tag">Tabelas {TABELAS.anoTabelas}</span>
      </div>
    </header>
  );
}

export function BannerAtualizacao() {
  const anoAtual = new Date().getFullYear();
  if (anoAtual <= TABELAS.anoTabelas) return null;
  return (
    <div className="banner-atualizacao" role="alert">
      <span>As tabelas de INSS e IRRF são de {TABELAS.anoTabelas}. Verifique se há atualização para {anoAtual}.</span>
      <a href="https://www.gov.br/receitafederal" target="_blank" rel="noreferrer">Verificar tabelas</a>
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

function Acao({
  label, onClick, children, className = '', disabled,
}: { label: string; onClick: () => void; children: ReactNode; className?: string; disabled?: boolean }) {
  return (
    <button className={`icon-btn ${className}`.trim()} onClick={onClick} disabled={disabled}
      title={label} aria-label={label}>
      {children}
      <span className="btn-tooltip" aria-hidden="true">{label}</span>
    </button>
  );
}

export function Hero({ gerandoPdf, onLimpar, onPdf, onImprimir, onTema }: HeroProps) {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow">Planilha de demonstração</span>
          <h1>Custo de mão de obra CLT</h1>
          <p>
            Quanto o empregado custa para a empresa, quanto recebe e o que provisionar — no Simples Nacional
            e no Lucro Presumido, com IRRF {TABELAS.anoTabelas}.
          </p>
        </div>
        <div className="hero-actions" role="toolbar" aria-label="Ações">
          <Acao label="Limpar simulação" onClick={onLimpar}><Icon name="trash" /></Acao>
          <Acao label="Salvar PDF" onClick={onPdf} disabled={gerandoPdf} className={gerandoPdf ? 'loading' : ''}>
            <Icon name="file" className="icon-default" />
            <Icon name="spinner" className="icon-spin" />
          </Acao>
          <Acao label="Imprimir" onClick={onImprimir}><Icon name="printer" /></Acao>
          <Acao label="Alternar tema" onClick={onTema} className="icon-theme">
            <Icon name="sun" className="icon-sun" />
            <Icon name="moon" className="icon-moon" />
          </Acao>
        </div>
      </div>
    </div>
  );
}

/** Cabeçalho do PDF/impressão — oculto na tela (ver .pdf-header em app.css). */
export const PdfHeader = forwardRef<HTMLDivElement, { regime: string }>(function PdfHeader({ regime }, ref) {
  return (
    <div ref={ref} className="pdf-header" id="pdf-header">
      <div className="pdf-header-row">
        <div>
          <div className="pdf-header-title">Simulador de Custo de Mão de Obra CLT</div>
          <div className="pdf-header-sub">Uso exclusivo para estimativa</div>
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
      <strong>Simulador CLT</strong> v5.2<br />
      INSS {TABELAS.anoTabelas} · IRRF {TABELAS.anoTabelas} com redutor da Lei 15.270/2025 · Simples Nacional e Lucro Presumido · Estimativa, não substitui a folha de pagamento
    </footer>
  );
}
