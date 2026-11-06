import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { TONE_ICON_CLASSES } from './StatCard';

/*
 * Small presentational helpers shared by the admin pages so tables, alerts
 * and detail panels look the same everywhere. Class tokens mirror DataTable.
 */

export const ADMIN_TABLE = {
  table: 'w-full text-left text-sm',
  headRow: 'border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40',
  th: 'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
  body: 'divide-y divide-slate-100 dark:divide-slate-800',
  row: 'transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
  clickableRow: 'cursor-pointer transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10',
  td: 'px-5 py-3.5 align-middle text-slate-700 dark:text-slate-300',
};

/** Neutral icon button used for row actions (view / edit / delete). */
export function IconAction({ label, onClick, tone = 'default', disabled, children }) {
  const tones = {
    default: 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-indigo-300',
    danger: 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
    success: 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10',
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-40 ${tones[tone] || tones.default}`}
    >
      {children}
    </button>
  );
}

/** Status pill driven by a `{ STATUS: classes }` map; underscores become spaces. */
export function StatusBadge({ status, styles = {}, fallback = 'UNKNOWN' }) {
  if (!status) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">{fallback === null ? '—' : fallback}</span>;
  }

  return (
    <Badge
      className={
        styles[status] ||
        'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }
    >
      {String(status).replaceAll('_', ' ')}
    </Badge>
  );
}

const ALERT_TONES = {
  danger: {
    icon: AlertCircle,
    box: 'border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10',
    title: 'text-rose-800 dark:text-rose-300',
    body: 'text-rose-700 dark:text-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    box: 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10',
    title: 'text-amber-900 dark:text-amber-200',
    body: 'text-amber-800 dark:text-amber-300',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    icon: CheckCircle2,
    box: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10',
    title: 'text-emerald-900 dark:text-emerald-200',
    body: 'text-emerald-800 dark:text-emerald-300',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  info: {
    icon: Info,
    box: 'border-indigo-200 bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/10',
    title: 'text-indigo-900 dark:text-indigo-200',
    body: 'text-indigo-800 dark:text-indigo-300',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

/** Inline callout for errors, warnings and confirmations. */
export function InlineAlert({ tone = 'danger', title, children, className = '' }) {
  const t = ALERT_TONES[tone] || ALERT_TONES.danger;
  const Icon = t.icon;

  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${t.box} ${className}`}
    >
      <Icon size={17} className={`mt-0.5 shrink-0 ${t.iconColor}`} />
      <div className="min-w-0">
        {title && <p className={`text-sm font-semibold ${t.title}`}>{title}</p>}
        {children && <div className={`text-xs leading-5 ${title ? 'mt-0.5' : ''} ${t.body}`}>{children}</div>}
      </div>
    </div>
  );
}

/** Label / value line for detail drawers. */
export function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`break-all text-xs font-medium text-slate-800 dark:text-slate-200 sm:max-w-[65%] sm:text-right ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

/** Titled block inside a drawer or detail panel. */
export function DetailSection({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={className}>
      <h3 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {Icon && <Icon size={14} />}
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Rounded segmented control used for status tabs. */
export function SegmentedTabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70">
      {tabs.map((tab) => {
        const active = value === tab.value;
        const Icon = tab.icon;

        return (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => onChange(tab.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              active
                ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {Icon && <Icon size={14} />}
            {tab.label}
            {tab.count != null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Card with an icon + title header, used by every admin create/edit form. */
export function FormSection({ icon: Icon, tone = 'indigo', title, description, action, children, className = '', bodyClassName = 'space-y-4' }) {
  return (
    <Card className={className}>
      <CardHeader className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TONE_ICON_CLASSES[tone] || TONE_ICON_CLASSES.indigo}`}>
              <Icon size={18} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardBody className={`p-5 ${bodyClassName}`}>{children}</CardBody>
    </Card>
  );
}

/** Sticky bottom bar holding a form's Cancel / Save buttons. */
export function FormActionBar({ hint, children }) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  );
}

/** Label / value list used in preview side cards. */
export function SummaryList({ items }) {
  return (
    <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-3 py-2">
          <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
          <dd className="text-right font-medium text-slate-800 dark:text-slate-200">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
