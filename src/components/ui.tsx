import type { ReactNode } from 'react';
import { brl } from '../domain/format';

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

export function Card({
  icon,
  iconClass,
  title,
  badge,
  children,
}: {
  icon: string;
  iconClass: string;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <div className={`card-icon ${iconClass}`}>{icon}</div>
        <h2>{title}</h2>
        {badge && <span className="step-badge">{badge}</span>}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
