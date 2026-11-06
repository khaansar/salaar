'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  Pencil,
  MapPin,
  Calendar,
  BarChart2,
  Trophy,
  BookOpen,
  LayoutList,
  FileText,
  Zap,
  History,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart
} from 'recharts';

import { useAppSelector } from '../../hooks/useAppSelector';
import {
  useGetAttemptHistoryQuery,
  useGetUserPerformanceQuery,
  useGetUserTopicPerformanceQuery,
  useGetYearlyStreakQuery,
} from '../../store/userApi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { Avatar } from '../ui/Avatar';
import { useRef, useState } from 'react';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { uploadAvatar } from '../../lib/avatarUpload';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
    const avatarInputRef = useRef(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setAvatarError('');
    setAvatarUploading(true);

    try {
        await uploadAvatar(file);
        await dispatch(fetchCurrentUser());
    } catch (error) {
        setAvatarError(error?.message || 'Failed to upload avatar.');
    } finally {
        setAvatarUploading(false);
    }
    };
  
  // Real Backend Data Hooks
  const { data: streak } = useGetYearlyStreakQuery();
  const { data: historyResponse } = useGetAttemptHistoryQuery({ page: 1, perPage: 20 });
  const { data: performance } = useGetUserPerformanceQuery();
  const { data: topicPerformance } = useGetUserTopicPerformanceQuery();

  // 1. User Header Mappings
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Student';
  const joinedDate = user?.createdAt || user?.joinedAt
    ? new Date(user.createdAt || user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;
  const location = user?.location || null;
  const targetExam = user?.targetExam?.trim() || null;

  // 2. Stats Mappings
  const totalAttempts = performance?.summary?.totalAttempts ?? 0;
  const avgScore = performance?.summary?.averageScorePercentage 
    ? Math.round(performance.summary.averageScorePercentage) 
    : 0;
  const avgAccuracy = performance?.summary?.averageAccuracyPercentage
    ? Math.round(performance.summary.averageAccuracyPercentage)
    : null;
  const avgPercentile = performance?.summary?.averagePercentile
    ? Math.round(performance.summary.averagePercentile)
    : null;
  // Compute total study hours from average time * total attempts
  const totalStudyHrs = (performance?.summary?.averageTimeTakenSeconds && totalAttempts)
    ? Math.round((performance.summary.averageTimeTakenSeconds * totalAttempts) / 3600)
    : null;

  // 3. Performance Chart Mappings
  let chartData = [];

  if (performance?.attempts && performance.attempts.length > 0) {
    const avgOverall = performance.summary?.averageScorePercentage
      ? Math.round(performance.summary.averageScorePercentage) : 0;
    const bestOverall = performance.summary?.bestScorePercentage
      ? Math.round(performance.summary.bestScorePercentage) : 0;
    chartData = performance.attempts.slice(-8).map(a => ({
      name: new Date(a.completedAt || a.startedAt || a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      your: Math.round(a.scorePercentage || 0),
      avg: avgOverall,
      top: bestOverall
    }));
  }

  // 4. Recent Tests Mappings
  const historyItems = Array.isArray(historyResponse) ? historyResponse : (historyResponse?.items || historyResponse?.data || []);
  let realRecentTests = [];

  if (historyItems.length > 0) {
    realRecentTests = historyItems.slice(0, 5).map(a => {
      const isSubmitted = String(a.status || '').toUpperCase() === 'SUBMITTED';
      return {
        id: a.attemptId,
        name: a.testName || 'Test Attempt',
        category: a.categoryName || '',
        date: new Date(a.startedAt || a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        score: a.finalScore != null ? `${Math.round(a.finalScore)}%` : (isSubmitted ? 'Done' : a.status || '—'),
        color: isSubmitted
          ? (a.finalScore != null && a.finalScore >= 70 ? 'text-emerald-500' : 'text-orange-500')
          : 'text-slate-500'
      };
    });
  }

  // 5. Streak Mappings
  const currentStreak = streak?.currentStreak ?? 0;
  const maxStreak = streak?.maxStreak ?? 0;
  const totalActiveDays = streak?.totalActiveDays ?? 0;

  // Calendar heatmap: one column per week (Monday first), one row per weekday,
  // covering the last 52 weeks up to today.
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HEAT_LEVELS = [
    'bg-slate-100 dark:bg-slate-800/80',
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-400 dark:bg-emerald-700',
    'bg-emerald-500 dark:bg-emerald-500',
  ];

  const toKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const heatmap = (() => {
    const activityMap = new Map();
    (Array.isArray(streak?.activity) ? streak.activity : []).forEach((item) => {
      if (item?.date) activityMap.set(item.date, Number(item.count) || 0);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = toKey(today);

    // Start on the Monday 51 weeks before this week's Monday.
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - mondayOffset - 51 * 7);

    const weeks = [];
    let totalTests = 0;

    for (let w = 0; w < 52; w += 1) {
      const days = [];
      for (let d = 0; d < 7; d += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = toKey(date);
        const future = date > today;
        const count = future ? 0 : activityMap.get(key) || 0;
        totalTests += count;
        days.push({
          key,
          count,
          future,
          isToday: key === todayKey,
          level: count >= 6 ? 3 : count >= 3 ? 2 : count >= 1 ? 1 : 0,
          label: `${count === 0 ? 'No tests' : `${count} test${count === 1 ? '' : 's'}`} · ${WEEKDAYS[d]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
        });
      }
      const firstDay = new Date(start);
      firstDay.setDate(start.getDate() + w * 7);
      const prevMonth = w === 0 ? null : new Date(firstDay.getTime() - 7 * 864e5).getMonth();
      const newMonth = w === 0 || firstDay.getMonth() !== prevMonth;
      weeks.push({ days, monthLabel: newMonth && w < 50 ? MONTHS[firstDay.getMonth()] : '' });
    }

    return { weeks, totalTests };
  })();

  // 6. Subject-wise Performance (from analytics sectionPerformance)
  const SECTION_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-rose-500', 'bg-purple-500', 'bg-indigo-500'];
  const subjectPerformance = (performance?.sectionPerformance || []).map((sec, i) => {
    const accuracy = sec.averageAccuracyPercentage != null ? Math.round(sec.averageAccuracyPercentage) : 0;
    return {
      name: sec.sectionName || `Section ${i + 1}`,
      score: accuracy,
      color: accuracy >= 75 ? 'bg-emerald-500'
           : accuracy >= 60 ? 'bg-blue-500'
           : accuracy >= 45 ? 'bg-orange-500'
           : 'bg-rose-500',
      attempts: sec.attempts || 0,
      correct: sec.correct || 0,
      incorrect: sec.incorrect || 0,
      unattempted: sec.unattempted || 0,
    };
  });

  const topicAnalysis = (topicPerformance?.topics && topicPerformance.topics.length > 0)
    ? topicPerformance.topics.map((t) => {
        const accuracy = t.accuracyPercentage != null ? Math.round(Number(t.accuracyPercentage)) : 0;
        return {
          topic: t.topic,
          attempted: t.totalQuestions,
          accuracy: `${accuracy}%`,
          avgTime: t.avgTimeSpentSeconds ? `${(t.avgTimeSpentSeconds / 60).toFixed(1)} min` : '—',
          accColor: accuracy >= 70 ? 'text-emerald-500' : accuracy >= 55 ? 'text-orange-500' : 'text-rose-500',
        };
      })
    : [];

  const strengths = (topicPerformance?.strengths && topicPerformance.strengths.length > 0)
    ? topicPerformance.strengths
    : [];

  const weaknesses = (topicPerformance?.weaknesses && topicPerformance.weaknesses.length > 0)
    ? topicPerformance.weaknesses
    : [];

  const aiInsight = topicPerformance?.aiInsight || null;

  return (
    <div className="mx-auto w-full max-w-[1200px] pb-10 space-y-6">
      
      {/* 1. Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="group relative h-28 w-28 shrink-0">
            <Avatar
                name={fullName}
                avatarUrl={user?.avatarUrl}
                size="lg"
                className="!h-28 !w-28 !text-3xl !border-4 !border-indigo-50 dark:!border-indigo-500/20"
            />

            <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                aria-label="Change profile picture"
                title={avatarUploading ? 'Uploading avatar...' : 'Change profile picture'}
                className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-wait"
            >
                {avatarUploading ? (
                <span className="text-xs font-medium">Uploading…</span>
                ) : (
                <Pencil size={22} />
                )}
            </button>

            {avatarError && (
                <p role="alert" className="mt-2 w-40 text-xs text-red-500">
                {avatarError}
                </p>
            )}
            </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              <Link href="/settings" title="Edit Profile" aria-label="Edit Profile">
                <Pencil size={14} className="text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer" />
              </Link>
            </div>
            {targetExam && (
              <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Aspirant for {targetExam}</p>
            )}
                        
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              {location && <div className="flex items-center gap-1.5"><MapPin size={14}/> {location}</div>}
              {joinedDate && <div className="flex items-center gap-1.5"><Calendar size={14}/> Member since {joinedDate}</div>}
              {targetExam && <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400"><Target size={14}/> Target: {targetExam}</div>}
            </div>
            
            <Link
              href="/settings"
              className="mt-4 inline-flex items-center px-5 py-1.5 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col gap-5 w-full md:w-auto">
          <div className="bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl p-3 flex items-center justify-between gap-8 border border-indigo-100/50 dark:border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">Current Preparation</p>
                {targetExam ? (
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mt-0.5">{targetExam}</p>
                ) : (
                  <Link href="/settings" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 inline-block hover:underline">
                    Set your target exam
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tests Attempted */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 size={24} className="fill-emerald-100/10 stroke-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tests Attempted</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalAttempts}</span>
              <span className="text-[10px] text-slate-400 font-medium">tests</span>
            </div>
          </div>
        </div>
        
        {/* Average Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100/50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <BarChart2 size={24} className="fill-blue-100/10 stroke-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Score</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgScore}%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Across all attempts</p>
          </div>
        </div>
        
        {/* Rank */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100/50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <Trophy size={24} className="fill-purple-100/10 stroke-purple-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Avg Percentile</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{avgPercentile != null ? `Top ${100 - avgPercentile}%` : '—'}</p>
            {avgPercentile != null && (
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Better than {avgPercentile}% students</p>
            )}
          </div>
        </div>
        
        {/* Study Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100/50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Clock size={24} className="fill-orange-100/10 stroke-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Study Time</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalStudyHrs != null ? `${totalStudyHrs} hrs` : '—'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Across all attempts</p>
          </div>
        </div>
      </div>

      {/* 3. Performance Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="flex min-w-0 flex-col gap-4">
        {/* Overall Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Overall Performance</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Last 8 tests</span>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-3 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600"></div><span className="text-slate-600 dark:text-slate-300">Your Score</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-100 dark:bg-blue-900/50"></div><span className="text-slate-600 dark:text-slate-300">Your Average</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600 dark:text-slate-300">Your Best</span></div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center text-center">
              <BarChart2 size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 font-medium">No completed tests yet</p>
              <p className="text-xs text-slate-400 mt-1">Your score trend appears after your first test</p>
            </div>
          ) : (
          <div className="h-[200px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="avg" fill="#e0e7ff" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="your" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="top" stroke="#10b981" strokeWidth={2} dot={{r: 3, fill: '#10b981', stroke: '#10b981'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Recent Tests */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Tests</h2>
            </div>
            <Link href="/history" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            {realRecentTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <History size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No tests taken yet</p>
                <p className="text-xs text-slate-400 mt-1">Take your first test to see your history here</p>
                <Link href="/tests" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">
                  Explore Tests
                </Link>
              </div>
            ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium text-xs">
                  <th className="pb-3 font-medium">Test Name</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {realRecentTests.map((test, i) => (
                  <tr key={i}>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-bold text-xs">{test.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">{test.date}</td>
                    <td className={`py-3 font-bold text-xs ${test.color}`}>{test.score}</td>
                    <td className="py-3">
                      <Link href={`/attempt/${test.id}/result`} className="px-3 py-1.5 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
        </div>

        {/* Subject-wise Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <LayoutList size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Subject-wise Performance</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">All tests</span>
          </div>
          
          <div className="space-y-6">
            {subjectPerformance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <LayoutList size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No section data yet</p>
                <p className="text-xs text-slate-400 mt-1">Complete a few tests to see subject-wise analysis</p>
              </div>
            ) : subjectPerformance.map((sub, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sub.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{sub.score}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Analysis Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        {/* Topic-wise Analysis */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Topic-wise Analysis</h2>
            </div>

          </div>
          
          <div className="overflow-x-auto flex-1">
            {topicAnalysis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No topic data yet</p>
                <p className="text-xs text-slate-400 mt-1">Complete a few tests to see topic-wise analysis</p>
              </div>
            ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium text-xs">
                  <th className="pb-3 font-medium">Topic</th>
                  <th className="pb-3 font-medium">Attempted</th>
                  <th className="pb-3 font-medium">Accuracy</th>
                  <th className="pb-3 font-medium">Avg. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {topicAnalysis.map((topic, i) => (
                  <tr key={i}>
                    <td className="py-3.5 text-slate-800 dark:text-slate-200 font-medium">{topic.topic}</td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">{topic.attempted}</td>
                    <td className={`py-3.5 font-bold ${topic.accColor}`}>{topic.accuracy}</td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">{topic.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-indigo-600 fill-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Strengths & Weaknesses</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-100/50 dark:border-emerald-500/20">
              <h3 className="text-sm font-bold text-emerald-600 mb-4">Your Strengths</h3>
              {strengths.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Not enough data yet.</p>}
              <ul className="space-y-3">
                {strengths.map((str, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-500 stroke-white dark:stroke-slate-900 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1 bg-rose-50/50 dark:bg-rose-500/5 rounded-xl p-4 border border-rose-100/50 dark:border-rose-500/20">
              <h3 className="text-sm font-bold text-rose-600 mb-4">Areas to Improve</h3>
              {weaknesses.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Not enough data yet.</p>}
              <ul className="space-y-3">
                {weaknesses.map((wk, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <AlertCircle size={16} className="text-rose-500 fill-rose-500 stroke-white dark:stroke-slate-900 shrink-0" />
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {aiInsight && (
          <div className="mt-4 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
              <Lightbulb size={16} className="fill-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">AI Insight</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {aiInsight}
              </p>
            </div>
          </div>
          )}
        </div>
      </div>


      {/* 5. Study Streak (full width) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Study Streak & Activity</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            {[
              { label: 'Current streak', value: currentStreak, unit: currentStreak === 1 ? 'day' : 'days', accent: true },
              { label: 'Longest streak', value: maxStreak, unit: maxStreak === 1 ? 'day' : 'days' },
              { label: 'Active days', value: totalActiveDays, unit: 'this year' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg border px-3 py-1.5 ${
                  stat.accent
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
                }`}
              >
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="flex items-baseline gap-1">
                  <span className={`text-base font-bold leading-tight ${stat.accent ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-1 [scrollbar-width:thin] lg:overflow-visible lg:pb-0">
          <div className="min-w-[680px]">
            {/* Month labels */}
            <div className="mb-1.5 flex gap-[3px] pl-9">
              {heatmap.weeks.map((week, index) => (
                <div key={index} className="relative h-3 flex-1">
                  {week.monthLabel && (
                    <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {week.monthLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {/* Weekday labels */}
              <div className="flex w-8 shrink-0 flex-col gap-[3px] pr-1">
                {WEEKDAYS.map((day, index) => (
                  <div key={day} className="flex flex-1 items-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {index % 2 === 0 ? day : ''}
                  </div>
                ))}
              </div>

              {heatmap.weeks.map((week, index) => (
                <div key={index} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  {week.days.map((day) => (
                    <div
                      key={day.key}
                      title={day.future ? undefined : day.label}
                      aria-label={day.future ? undefined : day.label}
                      className={`aspect-square w-full rounded-[3px] ${
                        day.future ? 'bg-transparent' : HEAT_LEVELS[day.level]
                      } ${day.isToday ? 'ring-2 ring-inset ring-orange-400' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{heatmap.totalTests}</span>{' '}
            {heatmap.totalTests === 1 ? 'test' : 'tests'} in the last year
          </p>
          <div className="flex items-center gap-[3px]">
            <span className="mr-1">Less</span>
            {HEAT_LEVELS.map((level, index) => (
              <span
                key={level}
                title={['No activity', '1–2 tests', '3–5 tests', '6+ tests'][index]}
                className={`h-3.5 w-3.5 rounded-[3px] ${level}`}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>

    </div>
  );
}