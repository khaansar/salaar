'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Users,
  UserCheck,
  ShieldCheck,
  X,
  Mail,
  CalendarDays,
  SlidersHorizontal,
  ChevronDown,
  LoaderCircle,
  Fingerprint,
  History,
} from 'lucide-react';

import { usersApi } from '@/services/userService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Drawer } from '@/components/ui/Drawer';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { Pagination, zeroBasedMeta } from '@/components/ui/Pagination';
import { StatCard } from '@/components/admin/StatCard';
import { ADMIN_TABLE, DetailRow, DetailSection, IconAction } from '@/components/admin/AdminUi';

const BREADCRUMBS = [{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Users' }];

const ADDITIONAL_TEXT_FILTERS = [
  ['firstName', 'First name', 'Filter first name'],
  ['lastName', 'Last name', 'Filter last name'],
  ['email', 'Email', 'Filter email'],
];

const ADDITIONAL_RANGE_FILTERS = [
  ['minTestsAttemptedCount', 'Min tests attempted', 'number'],
  ['maxTestsAttemptedCount', 'Max tests attempted', 'number'],
  ['createdAfter', 'Created after', 'date'], ['createdBefore', 'Created before', 'date'],
  ['updatedAfter', 'Updated after', 'date'], ['updatedBefore', 'Updated before', 'date'],
  ['deletedAfter', 'Deleted after', 'date'], ['deletedBefore', 'Deleted before', 'date'],
];

function RoleBadge({ role, label }) {
  const isAdmin = role?.toUpperCase() === 'ADMIN';

  return (
    <Badge
      className={
        isAdmin
          ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300'
          : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }
    >
      {isAdmin && <ShieldCheck size={11} />}
      {label}
    </Badge>
  );
}

function ActiveBadge({ active }) {
  return (
    <Badge tone={active ? 'success' : 'danger'}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState('');

  // Backend pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState({ totalUsers: null, activeUsers: null, adminUsers: null });

  // Filters are sent to the users API so they apply across all pages.
  const [filters, setFilters] = useState({
    search: '', firstName: '', lastName: '', email: '', role: '',
    isActive: '', isDeleted: '', minTestsAttemptedCount: '', maxTestsAttemptedCount: '',
    createdAfter: '', createdBefore: '', updatedAfter: '', updatedBefore: '',
    deletedAfter: '', deletedBefore: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  // Selected user for drawer
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;
    usersApi.stats()
      .then((stats) => {
        if (!cancelled) setUserStats(stats);
      })
      .catch((err) => {
        console.error('Failed to fetch overall user statistics:', err);
        if (!cancelled) setUserStats({ totalUsers: null, activeUsers: null, adminUsers: null });
      });
    return () => { cancelled = true; };
  }, []);

  // --------------------------------------------------
  // Fetch users
  // --------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => setAppliedFilters(filters), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const requestFilters = { ...appliedFilters };
        const searchTerms = requestFilters.search.trim().split(/\s+/);
        if (searchTerms.length > 1 && !requestFilters.firstName && !requestFilters.lastName && !requestFilters.email) {
          requestFilters.search = '';
          requestFilters.firstName = searchTerms[0];
          requestFilters.lastName = searchTerms.slice(1).join(' ');
        }

        const response = await usersApi.list({
          page,
          size: pageSize,
          ...requestFilters,
        });

        if (cancelled) return;
        const users = Array.isArray(response)
          ? response
          : Array.isArray(response?.content)
            ? response.content
            : Array.isArray(response?.data?.content)
              ? response.data.content
              : [];
        setUsers(users);
        setTotalPages(response?.totalPages ?? response?.data?.totalPages ?? (users.length > 0 ? 1 : 0));
        setTotalUsers(response?.totalElements ?? response?.data?.totalElements ?? users.length);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch users:', err);
        setError(
          err?.message || 'Failed to load users. Please try again.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasLoadedOnce(true);
        }
      }
    };

    fetchUsers();
    return () => { cancelled = true; };
  }, [page, appliedFilters]);

  // --------------------------------------------------
  // The API already returns the filtered page.
  // --------------------------------------------------
  const filteredUsers = useMemo(() => users, [users]);
  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const getFullName = (user) => {
    const name = `${user.firstName || ''} ${
      user.lastName || ''
    }`.trim();

    return name || 'Unknown User';
  };

  const getInitials = (user) => {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';

    return `${first}${last}`.toUpperCase() || '?';
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRole = (role) => {
    if (!role) return '—';

    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  // --------------------------------------------------
  // --------------------------------------------------
  // Reset filters
  // --------------------------------------------------
  const resetFilters = () => {
    setFilters({
      search: '', firstName: '', lastName: '', email: '', role: '',
      isActive: '', isDeleted: '', minTestsAttemptedCount: '', maxTestsAttemptedCount: '',
      createdAfter: '', createdBefore: '', updatedAfter: '', updatedBefore: '',
      deletedAfter: '', deletedBefore: '',
    });
    setPage(0);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  const setFilterAndResetPage = (key, value) => {
    updateFilter(key, value);
    setPage(0);
  };


  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------
  const goToPreviousPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages - 1) {
      setPage((prev) => prev + 1);
    }
  };


  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handlePageChange = (nextPage) => {
    if (nextPage - 1 < page) goToPreviousPage();
    else goToNextPage();
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading && !hasLoadedOnce) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader breadcrumbs={BREADCRUMBS} title="Users" subtitle="Manage and view all registered users" />
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)}
        </div>
        <Card>
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <Skeleton className="h-10 w-full" />
          </div>
          <TableSkeleton rows={8} cols={5} />
        </Card>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------
  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader breadcrumbs={BREADCRUMBS} title="Users" subtitle="Manage and view all registered users" />
        <Card>
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={BREADCRUMBS}
        title="Users"
        subtitle="Manage and view all registered users"
        actions={
          <span className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Users size={16} />
            {userStats.totalUsers ?? '—'} Users
          </span>
        }
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Users" value={userStats.totalUsers ?? '—'} icon={Users} tone="indigo" hint="All registered accounts" />
        <StatCard label="Active Users" value={userStats.activeUsers ?? '—'} icon={UserCheck} tone="emerald" hint="Accounts currently active" />
        <StatCard label="Admins" value={userStats.adminUsers ?? '—'} icon={ShieldCheck} tone="violet" hint="Users with admin access" />
      </div>

      <Card>
        {/* Filter bar */}
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Input
                aria-label="Search users"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilterAndResetPage('search', e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center">
              <div className="lg:w-40">
                <Select aria-label="Filter by role" value={filters.role} onChange={(e) => setFilterAndResetPage('role', e.target.value)}>
                  <option value="">All roles</option><option value="STUDENT">Student</option><option value="ADMIN">Admin</option>
                </Select>
              </div>
              <div className="lg:w-40">
                <Select aria-label="Filter by status" value={filters.isActive} onChange={(e) => setFilterAndResetPage('isActive', e.target.value)}>
                  <option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-expanded={showMoreFilters}
                onClick={() => setShowMoreFilters((open) => !open)}
                className={`flex-1 gap-2 lg:flex-none ${showMoreFilters ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300' : ''}`}
              >
                <SlidersHorizontal size={15} />
                More filters
                {hasActiveFilters && (
                  <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown size={15} className={`transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
              </Button>
              {hasActiveFilters && (
                <Button type="button" variant="ghost" onClick={resetFilters}>
                  <X size={15} className="mr-1.5" /> Clear
                </Button>
              )}
            </div>
          </div>

          {showMoreFilters && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Additional filters</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Narrow results by profile details, test activity, and dates.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ADDITIONAL_TEXT_FILTERS.map(([field, label, placeholder]) => (
                  <Input
                    key={field}
                    id={`user-filter-${field}`}
                    label={label}
                    value={filters[field]}
                    onChange={(e) => setFilterAndResetPage(field, e.target.value)}
                    placeholder={placeholder}
                  />
                ))}
                <Select id="user-filter-isDeleted" label="Deleted" value={filters.isDeleted} onChange={(e) => setFilterAndResetPage('isDeleted', e.target.value)}>
                  <option value="">Any</option><option value="true">Deleted</option><option value="false">Not deleted</option>
                </Select>
                {ADDITIONAL_RANGE_FILTERS.map(([field, label, type]) => (
                  <Input
                    key={field}
                    id={`user-filter-${field}`}
                    label={label}
                    type={type}
                    min={type === 'number' ? 0 : undefined}
                    value={filters[field]}
                    onChange={(e) => setFilterAndResetPage(field, e.target.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredUsers.length}</span> matching users on this page
            {' · '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalUsers}</span> total users
          </p>
          {loading && hasLoadedOnce && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <LoaderCircle size={14} className="animate-spin" /> Updating results
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className={`${ADMIN_TABLE.table} min-w-[760px]`}>
            <thead>
              <tr className={`${ADMIN_TABLE.headRow} border-t`}>
                <th className={`${ADMIN_TABLE.th} w-14`}>#</th>
                <th className={ADMIN_TABLE.th}>User</th>
                <th className={ADMIN_TABLE.th}>Role</th>
                <th className={ADMIN_TABLE.th}>Status</th>
                <th className={ADMIN_TABLE.th}>Joined on</th>
                <th className={`${ADMIN_TABLE.th} w-16 text-right`}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>

            <tbody className={`${ADMIN_TABLE.body} ${loading ? 'opacity-60' : ''}`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <Search size={20} />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">No users found</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} onClick={() => setSelectedUser(user)} className={ADMIN_TABLE.clickableRow}>
                    <td className={`${ADMIN_TABLE.td} text-xs tabular-nums text-slate-400 dark:text-slate-500`}>
                      {page * pageSize + index + 1}
                    </td>

                    <td className={ADMIN_TABLE.td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={getFullName(user)} avatarUrl={user.avatarUrl} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{getFullName(user)}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className={ADMIN_TABLE.td}>
                      <RoleBadge role={user.role} label={formatRole(user.role)} />
                    </td>

                    <td className={ADMIN_TABLE.td}>
                      <ActiveBadge active={user.isActive} />
                    </td>

                    <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs text-slate-500 dark:text-slate-400`}>
                      {formatDate(user.createdAt)}
                    </td>

                    <td className={`${ADMIN_TABLE.td} text-right`}>
                      <IconAction
                        label={`View ${getFullName(user)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                      >
                        <MoreHorizontal size={17} />
                      </IconAction>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          meta={zeroBasedMeta({ page, totalPages, totalElements: totalUsers, pageSize })}
          onPageChange={handlePageChange}
          disabled={loading}
        />
      </Card>

      {/* User drawer */}
      {selectedUser && (
        <Drawer open onClose={() => setSelectedUser(null)} title="User details" description="Profile and account information" width="md">
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <Avatar name={getFullName(selectedUser)} avatarUrl={selectedUser.avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900 dark:text-white">{getFullName(selectedUser)}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <RoleBadge role={selectedUser.role} label={formatRole(selectedUser.role)} />
                  <ActiveBadge active={selectedUser.isActive} />
                </div>
              </div>
            </div>

            <DetailSection title="Basic information">
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 dark:divide-slate-800 dark:border-slate-800">
                <DetailRow label={<span className="inline-flex items-center gap-2"><Mail size={13} />Email</span>} value={selectedUser.email || '—'} />
                <DetailRow label={<span className="inline-flex items-center gap-2"><ShieldCheck size={13} />Role</span>} value={formatRole(selectedUser.role)} />
                <DetailRow label={<span className="inline-flex items-center gap-2"><CalendarDays size={13} />Joined on</span>} value={formatDate(selectedUser.createdAt)} />
                <DetailRow label={<span className="inline-flex items-center gap-2"><Fingerprint size={13} />User ID</span>} value={selectedUser.id} mono />
              </div>
            </DetailSection>

            <DetailSection title="Account information" icon={History}>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/60 px-4 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/30">
                <DetailRow
                  label="Account status"
                  value={
                    <span className={selectedUser.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  }
                />
                <DetailRow label="Created" value={formatDate(selectedUser.createdAt)} />
                {selectedUser.updatedAt && <DetailRow label="Last updated" value={formatDate(selectedUser.updatedAt)} />}
              </div>
            </DetailSection>
          </div>
        </Drawer>
      )}
    </div>
  );
}
