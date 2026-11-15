'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Database,
  Filter,
  Fingerprint,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Terminal,
  UserRound,
  X,
} from 'lucide-react';
import { useGetAuditLogsQuery } from '@/store/adminApi';
import { siteConfig } from '@/config/site';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination, zeroBasedMeta } from '@/components/ui/Pagination';
import { StatCard } from '@/components/admin/StatCard';
import { InlineAlert } from '@/components/admin/AdminUi';

const PAGE_SIZE = 20;

const QUICK_RANGES = [
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 24 * 7 },
  { label: '30 days', hours: 24 * 30 },
];

const ACTION_STYLES = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  CREATED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
  UPDATE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
  UPDATED: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
  DELETED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
  PUBLISH: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  PUBLISHED: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  ARCHIVE: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  ARCHIVED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  LOGIN: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20',
  LOGGED_IN: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20',
  LOGOUT: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

function formatAction(action) {
  if (!action) return 'Unknown action';

  return String(action)
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionStyle(action) {
  const normalized = String(action || '').toUpperCase();

  const exact = ACTION_STYLES[normalized];
  if (exact) return exact;

  if (normalized.includes('DELETE')) return ACTION_STYLES.DELETE;
  if (normalized.includes('CREATE')) return ACTION_STYLES.CREATE;
  if (normalized.includes('UPDATE')) return ACTION_STYLES.UPDATE;
  if (normalized.includes('PUBLISH')) return ACTION_STYLES.PUBLISH;
  if (normalized.includes('ARCHIVE')) return ACTION_STYLES.ARCHIVE;
  if (normalized.includes('LOGIN')) return ACTION_STYLES.LOGIN;

  return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
}

function formatDate(value) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatRelativeDate(value) {
  if (!value) return '';

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days}d ago`;

  return formatDate(value);
}

function statusTone(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return 'text-emerald-600 dark:text-emerald-400';
  }

  if (statusCode >= 400) {
    return 'text-rose-600 dark:text-rose-400';
  }

  return 'text-amber-600 dark:text-amber-400';
}

function statusLabel(statusCode) {
  if (!statusCode) return '—';

  if (statusCode >= 200 && statusCode < 300) return `${statusCode} OK`;
  if (statusCode >= 400) return `${statusCode} Error`;

  return String(statusCode);
}

function MetadataBlock({ value }) {
  let formattedValue;

  try {
    const parsed =
      typeof value === 'string'
        ? JSON.parse(value)
        : value;

    formattedValue = JSON.stringify(
      parsed,
      null,
      2
    );
  } catch {
    formattedValue = String(value ?? '');
  }

  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {formattedValue}
    </pre>
  );
}

function MetadataValue({ metadata }) {
  if (!metadata) {
    return (
      <span className="text-sm text-slate-400 dark:text-slate-500">
        No metadata attached
      </span>
    );
  }

  return <MetadataBlock value={metadata} />;
}

function DetailItem({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-slate-700 dark:text-slate-200 break-words ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value || '—'}
      </p>
    </div>
  );
}

function AuditLogDetails({ log }) {
  const [copied, setCopied] = useState('');

  const copyValue = async (label, value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(label);

      window.setTimeout(() => {
        setCopied('');
      }, 1200);
    } catch {
      // Clipboard access can be unavailable in some browser contexts.
    }
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-5 dark:border-slate-800 dark:bg-slate-950/50 sm:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DetailItem label="Actor" value={log.actorName} />
        <DetailItem label="Role" value={log.actorRole} />
        <DetailItem label="Resource type" value={log.resourceType} />
        <DetailItem label="Resource ID" value={log.resourceId} mono />

        <DetailItem label="Service" value={log.service} />
        <DetailItem label="HTTP method" value={log.httpMethod} />
        <DetailItem label="Status" value={statusLabel(log.statusCode)} />
        <DetailItem label="Timestamp" value={formatDate(log.createdAt)} />

        <div className="sm:col-span-2 lg:col-span-4">
          <DetailItem label="Endpoint" value={log.endpoint} mono />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <DetailItem label="Event ID" value={log.eventId} mono />

            {log.eventId && (
              <button
                type="button"
                onClick={() => copyValue('event', log.eventId)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Copy size={12} />
                {copied === 'event' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <DetailItem label="Request ID" value={log.requestId} mono />

            {log.requestId && (
              <button
                type="button"
                onClick={() => copyValue('request', log.requestId)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Copy size={12} />
                {copied === 'request' ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
            Metadata
          </p>
          <MetadataValue metadata={log.metadata} />
        </div>
      </div>
    </div>
  );
}

function AuditRow({ log, expanded, onToggle }) {
  const successful = log.statusCode >= 200 && log.statusCode < 300;

  return (
    <div className="group border-b border-slate-100 last:border-b-0 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[auto_minmax(0,1.35fr)_minmax(130px,1fr)_minmax(110px,.8fr)_minmax(90px,.65fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:px-5"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-300">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getActionStyle(
                log.action
              )}`}
            >
              {formatAction(log.action)}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="truncate font-mono">{log.eventId || 'No event ID'}</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <UserRound size={13} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                {log.actorName || 'System'}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {log.actorRole || 'System actor'}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
            {log.resourceType || '—'}
          </p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400 dark:text-slate-500">
            {log.resourceId || 'No resource ID'}
          </p>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
            {log.service || '—'}
          </p>
          <p className={`mt-0.5 text-xs font-medium ${statusTone(log.statusCode)}`}>
            {statusLabel(log.statusCode)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
            {formatRelativeDate(log.createdAt)}
          </span>
        </div>
      </button>

      {expanded && <AuditLogDetails log={log} />}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1.35fr)_minmax(130px,1fr)_minmax(110px,.8fr)_minmax(90px,.65fr)_auto] items-center gap-4 border-b border-slate-100 px-4 py-5 dark:border-slate-800 sm:px-5">
      <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      </div>
      <div className="h-8 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-3 w-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      </div>
      <div className="h-3 w-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
    </div>
  );
}

function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
        <ShieldCheck size={26} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {filtered ? 'No matching events' : 'No audit activity yet'}
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {filtered
          ? 'Try a different search term or clear one of the active filters.'
          : 'Administrative activity will appear here as actions are recorded by the platform.'}
      </p>
    </div>
  );
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    actorId: '',
    action: '',
    resourceType: '',
    service: '',
    from: '',
    to: '',
  });

  const [filters, setFilters] = useState({
    actorId: '',
    action: '',
    resourceType: '',
    service: '',
    from: '',
    to: '',
  });

  const queryArgs = useMemo(
    () => ({
      ...filters,
      page,
      size: PAGE_SIZE,
    }),
    [filters, page]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAuditLogsQuery(queryArgs);

  const logs = Array.isArray(data?.content) ? data.content : [];

  const visibleLogs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return logs;

    return logs.filter((log) =>
      [
        log.actorName,
        log.actorRole,
        log.action,
        log.resourceType,
        log.resourceId,
        log.service,
        log.endpoint,
        log.requestId,
        log.eventId,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [logs, search]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const successfulCount = logs.filter(
    (log) => log.statusCode >= 200 && log.statusCode < 300
  ).length;

  const failedCount = logs.filter(
    (log) => log.statusCode >= 400
  ).length;

  const applyFilters = () => {
    setPage(0);
    setExpandedId(null);
    setFilters({ ...draftFilters });
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const empty = {
      actorId: '',
      action: '',
      resourceType: '',
      service: '',
      from: '',
      to: '',
    };

    setDraftFilters(empty);
    setFilters(empty);
    setSearch('');
    setPage(0);
    setExpandedId(null);
    setFiltersOpen(false);
  };

  const setQuickRange = (hours) => {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);

    const next = {
      ...filters,
      from: from.toISOString(),
      to: to.toISOString(),
    };

    setDraftFilters(next);
    setFilters(next);
    setPage(0);
    setExpandedId(null);
  };

  const removeFilter = (key) => {
    const next = {
      ...filters,
      [key]: '',
    };

    setFilters(next);
    setDraftFilters(next);
    setPage(0);
    setExpandedId(null);
  };


  const changePage = (nextPage) => {
    setPage(Math.max(0, nextPage - 1));
    setExpandedId(null);
  };

  const toIsoInput = (value) => (value ? new Date(value).toISOString().slice(0, 16) : '');
  const fromIsoInput = (value) => (value ? new Date(value).toISOString() : '');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Audit Logs' }]}
        title="Audit Logs"
        subtitle={`Trace administrative actions, API activity and system events across ${siteConfig.name}.`}
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      {/* Activity summary for the loaded page */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Loaded events" value={logs.length} hint="Latest server-side audit activity" icon={Activity} tone="indigo" loading={isLoading} />
        <StatCard label="Successful" value={successfulCount} hint="2xx responses on this page" icon={CheckCircle2} tone="emerald" loading={isLoading} />
        <StatCard label="Errors" value={failedCount} hint="4xx / 5xx responses on this page" icon={AlertCircle} tone="rose" loading={isLoading} />
      </div>

      <Card>
        {/* Toolbar */}
        <div className="space-y-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Input
                type="search"
                aria-label="Search loaded events"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search loaded events by actor, action, resource or request ID..."
                leftIcon={<Search size={16} />}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
              className={`gap-2 ${filtersOpen || activeFilterCount ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300' : ''}`}
            >
              <Filter size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-400 dark:text-slate-500">Quick scope</span>
            {QUICK_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setQuickRange(range.hours)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300"
              >
                Last {range.label}
              </button>
            ))}

            {activeFilterCount > 0 &&
              Object.entries(filters).map(([key, value]) => {
                if (!value) return null;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => removeFilter(key)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {key === 'from'
                      ? `From ${formatDate(value)}`
                      : key === 'to'
                        ? `To ${formatDate(value)}`
                        : `${key}: ${value}`}
                    <X size={12} />
                  </button>
                );
              })}

            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-slate-400 transition-colors hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
            >
              Clear scope
            </button>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Event filters</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Filters are applied server-side.</p>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input id="audit-actor" label="Actor ID" placeholder="UUID" value={draftFilters.actorId} onChange={(event) => setDraftFilters((current) => ({ ...current, actorId: event.target.value }))} />
                <Input id="audit-action" label="Action" placeholder="e.g. test.published" value={draftFilters.action} onChange={(event) => setDraftFilters((current) => ({ ...current, action: event.target.value }))} />
                <Input id="audit-resource" label="Resource type" placeholder="e.g. TEST" value={draftFilters.resourceType} onChange={(event) => setDraftFilters((current) => ({ ...current, resourceType: event.target.value }))} />
                <Input id="audit-service" label="Service" placeholder="e.g. test-service" value={draftFilters.service} onChange={(event) => setDraftFilters((current) => ({ ...current, service: event.target.value }))} />
                <Input id="audit-from" label="From" type="datetime-local" value={toIsoInput(draftFilters.from)} onChange={(event) => setDraftFilters((current) => ({ ...current, from: fromIsoInput(event.target.value) }))} />
                <Input id="audit-to" label="To" type="datetime-local" value={toIsoInput(draftFilters.to)} onChange={(event) => setDraftFilters((current) => ({ ...current, to: fromIsoInput(event.target.value) }))} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setFiltersOpen(false)}>Cancel</Button>
                <Button type="button" onClick={applyFilters}>Apply filters</Button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {isError && (
          <div className="p-4">
            <InlineAlert tone="danger" title="Unable to load audit logs">
              Check the IAM service and try refreshing the page.
            </InlineAlert>
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[auto_minmax(0,1.35fr)_minmax(130px,1fr)_minmax(110px,.8fr)_minmax(90px,.65fr)_auto] items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 sm:px-5">
              <span className="w-7" />
              <span>Event</span>
              <span>Actor</span>
              <span>Resource</span>
              <span>Service</span>
              <span className="text-right">Time</span>
            </div>

            {isLoading ? (
              Array.from({ length: 7 }).map((_, index) => <SkeletonRow key={index} />)
            ) : visibleLogs.length === 0 ? (
              <EmptyState filtered={Boolean(search || activeFilterCount)} />
            ) : (
              visibleLogs.map((log) => (
                <AuditRow
                  key={log.eventId}
                  log={log}
                  expanded={expandedId === log.eventId}
                  onToggle={() => setExpandedId((current) => (current === log.eventId ? null : log.eventId))}
                />
              ))
            )}
          </div>
        </div>

        {/* Mobile list */}
        <div className="md:hidden">
          {isLoading ? (
            <div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-3 border-b border-slate-100 p-4 dark:border-slate-800">
                  <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                </div>
              ))}
            </div>
          ) : visibleLogs.length === 0 ? (
            <EmptyState filtered={Boolean(search || activeFilterCount)} />
          ) : (
            visibleLogs.map((log) => {
              const expanded = expandedId === log.eventId;

              return (
                <div key={log.eventId} className="border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setExpandedId((current) => (current === log.eventId ? null : log.eventId))}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getActionStyle(log.action)}`}>
                            {formatAction(log.action)}
                          </span>
                          <span className={`text-xs font-medium ${statusTone(log.statusCode)}`}>{statusLabel(log.statusCode)}</span>
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{log.actorName || 'System'}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {log.resourceType || 'Unknown resource'}
                          {log.service ? ` · ${log.service}` : ''}
                        </p>
                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  </button>

                  {expanded && <AuditLogDetails log={log} />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer / pagination */}
        {!isLoading && totalElements > 0 && (
          <>
            <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <Database size={14} />
              <span>
                {visibleLogs.length !== logs.length
                  ? `${visibleLogs.length} of ${logs.length} loaded events match your search`
                  : `${totalElements.toLocaleString()} total events`}
              </span>
            </div>
            <Pagination
              meta={zeroBasedMeta({ page, totalPages, totalElements, pageSize: PAGE_SIZE })}
              onPageChange={changePage}
              disabled={isFetching}
            />
          </>
        )}
      </Card>

      {/* Footer hint */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <Fingerprint size={13} />
          <span>Audit events are immutable records from the backend.</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Terminal size={12} /> API activity</span>
          <span className="inline-flex items-center gap-1"><Server size={12} /> Service events</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={12} /> UTC timestamps</span>
        </div>
      </div>
    </div>
  );
}
