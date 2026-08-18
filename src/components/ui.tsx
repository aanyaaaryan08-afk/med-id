import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn('card', hover && 'card-hover', className)}>{children}</div>
  );
}

type Tone = 'teal' | 'blue' | 'green' | 'amber' | 'red' | 'slate';

const toneClasses: Record<Tone, string> = {
  teal: 'bg-teal-50 text-teal-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-ink-100 text-ink-600',
};

export function Badge({
  children,
  tone = 'slate',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn('chip', toneClasses[tone], className)}>{children}</span>;
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-lg sm:text-xl font-bold text-ink-900 truncate">{title}</h2>
          {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="py-10 text-center">
      <div className="inline-grid place-items-center h-14 w-14 rounded-2xl bg-ink-100 text-ink-400 mx-auto mb-3">
        {icon}
      </div>
      <h3 className="font-display font-bold text-ink-800">{title}</h3>
      <p className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">{message}</p>
    </div>
  );
}
