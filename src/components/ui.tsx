import type { ReactNode } from 'react';
import { brl } from '../domain/format';

/** Conjunto único de ícones (traço 2px, 24×24) — evita emojis, que variam por sistema. */
const PATHS = {
  landmark: 'M3 21h18M5 21V10m4 11V10m6 11V10m4 11V10M2 10l10-6 10 6',
  form: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  table: 'M3 5h18v14H3zM3 10h18M9 5v14',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zM16 14h2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4m8-4v4',
  pie: 'M21 12A9 9 0 1 1 12 3v9zM15 3.5A9 9 0 0 1 20.5 9H15z',
  scale: 'M12 3v18M6 21h12M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z',
  alert: 'M12 3 2 20h20zM12 10v5M12 18v.01',
  award: 'M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 13.5 7 22l5-3 5 3-1.5-8.5',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  bus: 'M5 4h14a1 1 0 0 1 1 1v11H4V5a1 1 0 0 1 1-1zM4 11h16M7 20v-4m10 4v-4M8 14h.01M16 14h.01',
  utensils: 'M5 3v8a2 2 0 0 0 2 2v8M9 3v8M7 3v8M17 21V3c-2 1-4 4-4 8h4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  coins: 'M9 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM15 9.5a6 6 0 1 1-3.5 10.7M7 6.5h4m-4 3h3',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.01',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21h15',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  spinner: 'M21 12a9 9 0 1 1-9-9',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Valor monetário que "pulsa" quando muda (a key força o replay da animação). */
export function Valor({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span key={value} className={`${className} flash`.trim()}>
      {brl(value)}
    </span>
  );
}

/** Linha rótulo/valor dos cards de resultado. */
export function Linha({
  label,
  value,
  tom,
  destaque,
}: {
  label: ReactNode;
  value: number;
  tom?: 'red' | 'grn';
  destaque?: boolean;
}) {
  const cls = ['rv', tom && `rv-${tom}`, destaque && 'rv-hi'].filter(Boolean).join(' ');
  return (
    <div className="rr">
      <span className={destaque ? 'rl rl-strong' : 'rl'}>{label}</span>
      <span className={cls}>{brl(value)}</span>
    </div>
  );
}

export type TomCard = 'accent' | 'green' | 'amber' | 'red' | 'purple';
const TOM_CLASS: Record<TomCard, string> = {
  accent: '', green: 'ci-green', amber: 'ci-amber', red: 'ci-red', purple: 'ci-purple',
};

export function Card({
  icon,
  tom = 'accent',
  title,
  badge,
  children,
}: {
  icon: IconName;
  tom?: TomCard;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-header">
        <div className={`card-icon ${TOM_CLASS[tom]}`.trim()}><Icon name={icon} /></div>
        <h2>{title}</h2>
        {badge && <span className="step-badge">{badge}</span>}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
