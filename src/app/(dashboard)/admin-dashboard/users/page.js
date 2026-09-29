'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
  Mail,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  LoaderCircle,
} from 'lucide-react';

import { usersApi } from '@/services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState('');

  // Backend pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

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
        const users = Array.isArray(response) ? response : [];
        setUsers(users);
        setTotalPages(users.length > 0 ? 1 : 0);
        setTotalUsers(users.length);
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
  // Counts for current API page
  // --------------------------------------------------
  const activeCount = users.filter(
    (user) => user.isActive === true
  ).length;

  const inactiveCount = users.filter(
    (user) => user.isActive === false
  ).length;

  const adminCount = users.filter(
    (user) => user.role?.toUpperCase() === 'ADMIN'
  ).length;

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

  const filterInputClass = 'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

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

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-gray-200" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-24 rounded-xl bg-gray-200" />
            <div className="h-24 rounded-xl bg-gray-200" />
            <div className="h-24 rounded-xl bg-gray-200" />
          </div>

          <div className="h-14 rounded-xl bg-gray-200" />
          <div className="h-96 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage and view all registered users
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{totalUsers} Users</span>
          </div>
        </div>
      </div>

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Users
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {activeCount}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Admins */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Admins
              </p>

              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {adminCount}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-3">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          FILTER BAR
      ================================================== */}
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><SlidersHorizontal className="h-4 w-4" /></div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Filter users</h2>
              <p className="mt-0.5 text-xs text-gray-500">Find accounts by identity, role, or activity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && hasLoadedOnce && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Updating results</span>}
            {hasActiveFilters && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">{Object.values(filters).filter(Boolean).length} active</span>}
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="relative flex-1">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Search</span>
            <Search className="absolute left-3 top-[2.45rem] h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className={`${filterInputClass} rounded-xl bg-slate-50/70 pl-9 focus:border-violet-400 focus:ring-violet-100`} placeholder="Name or email..." value={filters.search} onChange={(e) => setFilterAndResetPage('search', e.target.value)} />
          </label>
          <label className="lg:w-44">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Role</span>
            <select className={`${filterInputClass} rounded-xl bg-slate-50/70 focus:border-violet-400 focus:ring-violet-100`} value={filters.role} onChange={(e) => setFilterAndResetPage('role', e.target.value)}>
              <option value="">All roles</option><option value="STUDENT">Student</option><option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="lg:w-40">
            <span className="mb-1.5 block text-xs font-medium text-gray-600">Status</span>
            <select className={`${filterInputClass} rounded-xl bg-slate-50/70 focus:border-violet-400 focus:ring-violet-100`} value={filters.isActive} onChange={(e) => setFilterAndResetPage('isActive', e.target.value)}>
              <option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option>
            </select>
          </label>
          <button type="button" aria-expanded={showMoreFilters} onClick={() => setShowMoreFilters((open) => !open)} className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${showMoreFilters ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
            <SlidersHorizontal className="h-4 w-4" />More Filters{hasActiveFilters && <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-xs text-violet-700">{Object.values(filters).filter(Boolean).length}</span>}<ChevronDown className={`h-4 w-4 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
          </button>
          {hasActiveFilters && <button type="button" onClick={resetFilters} className="flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"><X className="h-4 w-4" />Clear</button>}
        </div>
        {showMoreFilters && (
          <div className="mt-5 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Additional filters</h3>
              <p className="mt-1 text-xs text-gray-500">Narrow results by profile details, test activity, and dates.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {['firstName', 'lastName', 'email'].map((field) => (
                <label key={field}>
                  <span className="mb-1 block text-xs font-medium text-gray-500">{field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : 'Email'}</span>
                  <input className={`${filterInputClass} rounded-xl bg-white focus:border-violet-400 focus:ring-violet-100`} value={filters[field]} onChange={(e) => setFilterAndResetPage(field, e.target.value)} placeholder={`Filter ${field === 'firstName' ? 'first name' : field === 'lastName' ? 'last name' : 'email'}`} />
                </label>
              ))}
              <label>
                <span className="mb-1 block text-xs font-medium text-gray-500">Deleted</span>
                <select className={`${filterInputClass} rounded-xl bg-white focus:border-violet-400 focus:ring-violet-100`} value={filters.isDeleted} onChange={(e) => setFilterAndResetPage('isDeleted', e.target.value)}>
                  <option value="">Any</option><option value="true">Deleted</option><option value="false">Not deleted</option>
                </select>
              </label>
              {[
                ['minTestsAttemptedCount', 'Min tests attempted', 'number'],
                ['maxTestsAttemptedCount', 'Max tests attempted', 'number'],
                ['createdAfter', 'Created after', 'date'], ['createdBefore', 'Created before', 'date'],
                ['updatedAfter', 'Updated after', 'date'], ['updatedBefore', 'Updated before', 'date'],
                ['deletedAfter', 'Deleted after', 'date'], ['deletedBefore', 'Deleted before', 'date'],
              ].map(([field, label, type]) => (
                <label key={field}>
                  <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
                  <input type={type} min={type === 'number' ? 0 : undefined} className={`${filterInputClass} rounded-xl bg-white focus:border-violet-400 focus:ring-violet-100`} value={filters[field]} onChange={(e) => setFilterAndResetPage(field, e.target.value)} />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="w-16 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  #
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  User
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Role
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Joined On
                </th>

                <th className="w-20 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="mb-3 rounded-full bg-gray-100 p-3">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>

                      <p className="text-sm font-medium text-gray-900">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    {/* Number */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {page * pageSize + index + 1}
                    </td>

                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={getFullName(user)}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {getInitials(user)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {getFullName(user)}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.role?.toUpperCase() === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================
            PAGINATION
        ================================================== */}
        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium text-gray-700">
              {filteredUsers.length}
            </span>{' '}
            matching users on this page
            {' · '}
            <span className="font-medium text-gray-700">
              {totalUsers}
            </span>{' '}
            total users
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={page === 0}
              className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-gray-900 px-3 text-sm font-medium text-white">
              {page + 1}
            </div>

            <span className="text-sm text-gray-400">
              of {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={page >= totalPages - 1}
              className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================
          USER DRAWER
      ================================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedUser(null)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-[380px] overflow-y-auto bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={getFullName(selectedUser)}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {getInitials(selectedUser)}
                    </div>
                  )}

                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {getFullName(selectedUser)}
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {selectedUser.email}
                    </p>

                    <div className="mt-2">
                      {selectedUser.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="px-6 py-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Basic Information
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-gray-400" />

                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.email || '—'}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-gray-400" />

                  <div>
                    <p className="text-xs text-gray-500">
                      Role
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {formatRole(selectedUser.role)}
                    </p>
                  </div>
                </div>

                {/* Joined */}
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />

                  <div>
                    <p className="text-xs text-gray-500">
                      Joined On
                    </p>

                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>

                {/* User ID */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500">
                    User ID
                  </p>

                  <p className="mt-1 break-all text-xs text-gray-700">
                    {selectedUser.id}
                  </p>
                </div>
              </div>

              {/* Account Information */}
              <div className="mt-8">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Account Information
                </h3>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Account Status
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        selectedUser.isActive
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selectedUser.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Created
                    </span>

                    <span className="text-sm text-gray-700">
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>

                  {selectedUser.updatedAt && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Last Updated
                      </span>

                      <span className="text-sm text-gray-700">
                        {formatDate(selectedUser.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
