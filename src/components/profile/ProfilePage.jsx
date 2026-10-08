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
  ChevronDown,
  BarChart2,
  TrendingUp,
  Trophy,
  BookOpen,
  LayoutList,
  FileText,
  Zap,
  History,
  Sparkles,
  Settings,
  Bell,
  CreditCard,
  User,
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

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  
  // Real Backend Data Hooks
  const { data: streak } = useGetYearlyStreakQuery();
  const { data: historyResponse } = useGetAttemptHistoryQuery({ page: 1, perPage: 20 });
  const { data: performance } = useGetUserPerformanceQuery();
  const { data: topicPerformance } = useGetUserTopicPerformanceQuery();

  // 1. User Header Mappings
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Rohit Sharma';
  const joinedDate = user?.createdAt || user?.joinedAt 
    ? new Date(user.createdAt || user.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : 'Jan 2024';
  const location = user?.location || 'Bangalore, India';

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
  let chartData = [
    { name: 'Aug 10', your: 38, avg: 52, top: 75 },
    { name: 'Aug 17', your: 42, avg: 54, top: 78 },
    { name: 'Aug 24', your: 45, avg: 54, top: 78 },
    { name: 'Aug 31', your: 48, avg: 55, top: 79 },
    { name: 'Sep 7', your: 55, avg: 58, top: 82 },
    { name: 'Sep 14', your: 65, avg: 59, top: 85 },
    { name: 'Sep 21', your: 72, avg: 62, top: 88 },
    { name: 'Sep 28', your: 78, avg: 64, top: 92 },
  ]; // Fallback to design mock

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
        rank: '—',
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

  const renderHeatmap = () => {
    const activityMap = new Map();
    if (Array.isArray(streak?.activity)) {
      streak.activity.forEach((item) => {
        if (item?.date) {
          activityMap.set(item.date, Number(item.count) || 0);
        }
      });
    }

    const cols = 20;
    const rows = 7;
    const totalDays = cols * rows;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    const grid = [];
    for(let r=0; r<rows; r++) {
      const row = [];
      for(let c=0; c<cols; c++) {
        // Calculate date for this cell (top-to-bottom, left-to-right filling)
        const dayOffset = c * rows + r;
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + dayOffset);
        
        const year = cellDate.getFullYear();
        const month = String(cellDate.getMonth() + 1).padStart(2, '0');
        const day = String(cellDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        const count = activityMap.get(dateKey) || 0;
        
        let colorClass = "bg-slate-100 dark:bg-slate-800";
        if (cellDate > today) {
          colorClass = "bg-transparent"; // Future dates are invisible
        } else if (streak) {
          // Real data colors
          if (count >= 6) colorClass = "bg-emerald-500";
          else if (count >= 3) colorClass = "bg-emerald-400";
          else if (count >= 1) colorClass = "bg-emerald-200";
        } else {
          // Fallback deterministic mock if no streak data yet
          const pseudoRand1 = ((r * 17) + (c * 31)) % 100 / 100; 
          const pseudoRand2 = ((r * 23) + (c * 29)) % 100 / 100;
          if (c > 3 && pseudoRand1 > 0.4) {
             if (pseudoRand2 > 0.8) colorClass = "bg-emerald-500";
             else if (pseudoRand2 > 0.6) colorClass = "bg-emerald-400";
             else if (pseudoRand2 > 0.4) colorClass = "bg-emerald-300";
             else colorClass = "bg-emerald-200";
          }
        }
        
        row.push(<div key={`${r}-${c}`} title={count > 0 ? `${count} tests on ${dateKey}` : dateKey} className={`w-3 h-3 rounded-[2px] ${colorClass}`}></div>);
      }
      grid.push(<div key={r} className="flex gap-1">{row}</div>);
    }
    return <div className="flex flex-col gap-1">{grid}</div>;
  };

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
          avgTime: t.avgTimeSpentSeconds ? `${(t.avgTimeSpentSeconds / 60).toFixed(1)} min` : '1.5 min',
          accColor: accuracy >= 70 ? 'text-emerald-500' : accuracy >= 55 ? 'text-orange-500' : 'text-rose-500',
        };
      })
    : [
        { topic: 'Number System', attempted: 12, accuracy: '92%', avgTime: '1.2 min', accColor: 'text-emerald-500' },
        { topic: 'Simplification', attempted: 18, accuracy: '78%', avgTime: '1.5 min', accColor: 'text-emerald-500' },
        { topic: 'Algebra', attempted: 15, accuracy: '73%', avgTime: '2.1 min', accColor: 'text-orange-500' },
        { topic: 'Geometry', attempted: 10, accuracy: '60%', avgTime: '2.8 min', accColor: 'text-orange-500' },
        { topic: 'Trigonometry', attempted: 8, accuracy: '50%', avgTime: '3.2 min', accColor: 'text-rose-500' },
      ];

  const strengths = (topicPerformance?.strengths && topicPerformance.strengths.length > 0)
    ? topicPerformance.strengths
    : [
        'Number System (92%)',
        'Simplification (78%)',
        'Blood Relations (75%)',
        'Error Spotting (72%)',
        'Current Affairs (70%)'
      ];

  const weaknesses = (topicPerformance?.weaknesses && topicPerformance.weaknesses.length > 0)
    ? topicPerformance.weaknesses
    : [
        'Trigonometry (50%)',
        'Geometry (55%)',
        'Idioms & Phrases (58%)',
        'Advanced Math (60%)',
        'Static GK (62%)'
      ];

  const aiInsight = topicPerformance?.aiInsight || 'You perform well in Number System and Simplification. Focus more on Trigonometry and Geometry to improve your overall score.';

  return (
    <div className="mx-auto w-full max-w-[1200px] pb-10 space-y-6">
      
      {/* 1. Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <img src={user.avatarUrl || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-500/20" />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{fullName}</h1>
              <Pencil size={14} className="text-indigo-500 cursor-pointer" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Aspirant for SSC CGL 2025</p>
            <p className="text-slate-500 text-sm mt-1">&quot;Consistent practice today, success tomorrow.&quot;</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5"><MapPin size={14}/> {location}</div>
              <div className="flex items-center gap-1.5"><Calendar size={14}/> Member since {joinedDate}</div>
              <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400"><Target size={14}/> Target: SSC CGL 2025</div>
            </div>
            
            <button className="mt-4 px-5 py-1.5 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
              Edit Profile
            </button>
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
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mt-0.5">SSC CGL 2025</p>
              </div>
            </div>
            <ChevronDown size={18} className="text-indigo-400" />
          </div>
          <div className="flex justify-between md:justify-start gap-8 px-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Days to Exam</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">132</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Exam Date</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">12 Feb 2026</p>
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
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp size={10} /> 12%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Last 10 tests</p>
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
        {/* Overall Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Overall Performance</h2>
            </div>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Last 8 Weeks</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 mb-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600"></div><span className="text-slate-600 dark:text-slate-300">Your Score</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-100 dark:bg-blue-900/50"></div><span className="text-slate-600 dark:text-slate-300">Average Score</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600 dark:text-slate-300">Topper Score</span></div>
          </div>

          <div className="h-[250px] w-full text-xs">
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
        </div>

        {/* Subject-wise Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <LayoutList size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Subject-wise Performance</h2>
            </div>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">All Tests</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
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
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Quantitative Aptitude</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
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
          </div>
          
          <div className="mt-4 flex justify-center">
            <button className="px-4 py-2 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5">
              View Detailed Analysis <ArrowRight size={14} />
            </button>
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
        </div>
      </div>

      {/* 5. Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
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
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {realRecentTests.map((test, i) => (
                  <tr key={i}>
                    <td className="py-3 text-slate-800 dark:text-slate-200 font-bold text-xs">{test.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">{test.date}</td>
                    <td className={`py-3 font-bold text-xs ${test.color}`}>{test.score}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 text-xs font-medium">{test.rank}</td>
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

        {/* Study Streak & Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Study Streak & Activity</h2>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-medium text-slate-500">Current Streak</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5"><span className="text-orange-500">{currentStreak}</span> days</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <p className="text-[10px] font-medium text-slate-500">Longest Streak</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{maxStreak} days</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <p className="text-[10px] font-medium text-slate-500">Total Active Days</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalActiveDays}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex flex-col gap-2 text-[9px] text-slate-400 justify-between py-1 pr-1 font-medium">
              <span>M1</span>
              <span>M2</span>
              <span>M3</span>
            </div>
            <div className="flex-1 overflow-x-auto [scrollbar-width:none]">
              {renderHeatmap()}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div> No activity</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-200"></div> 1-2 tests</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-400"></div> 3-5 tests</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> 6+ tests</div>
          </div>
        </div>
      </div>

      {/* 6. Achievements Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
        {/* Achievements */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500 fill-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Achievements</h2>
            </div>
            <Link href="#" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-3">
                 <Trophy size={32} className="text-rose-500 fill-rose-500" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">First Test</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">Completed your first test</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 relative">
              <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 text-white z-10">
                <CheckCircle2 size={10} className="fill-white text-emerald-500 dark:text-slate-900" />
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                 <CheckCircle2 size={32} className="text-emerald-500 fill-emerald-500 stroke-white dark:stroke-slate-900" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Score 80%+</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">Scored 80%+ in a test</p>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-3">
                 <Flame size={32} className="text-orange-500 fill-orange-500" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">10 Day Streak</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">Practiced for 10 consecutive days</p>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
                 <Zap size={32} className="text-blue-500 fill-blue-500 stroke-white dark:stroke-slate-900" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Top 10%</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">Ranked in top 10% in a test</p>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500 fill-purple-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
            </div>
            <Link href="#" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                <Target size={18} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Practice more on Trigonometry</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Your accuracy is 50% which is below average.</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Take more full-length tests</p>
                <p className="text-[10px] text-slate-500 mt-0.5">You have attempted only 5 full tests this month.</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Revise previous year papers</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Your score in PYQs is 15% lower than mock tests.</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* 7. Account & Preferences */}
      <div className="bg-transparent mt-2">
        <div className="flex items-center gap-2 mb-4 px-1">
          <Settings size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Account & Preferences</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
              <User size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Personal Information</h3>
            <p className="text-xs text-slate-500 mb-4 flex-1">Name, email, phone, location</p>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
              Manage <ArrowRight size={12} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col group">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
              <Target size={20} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Exam Preferences</h3>
            <p className="text-xs text-slate-500 mb-4 flex-1">Your target exams and subjects</p>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
              Manage <ArrowRight size={12} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
              <Bell size={20} className="text-blue-600 fill-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Notification Settings</h3>
            <p className="text-xs text-slate-500 mb-4 flex-1">Test alerts, results, offers</p>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
              Manage <ArrowRight size={12} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors cursor-pointer flex flex-col group">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-colors">
              <CreditCard size={20} className="text-orange-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Subscription & Purchases</h3>
            <p className="text-xs text-slate-500 mb-4 flex-1">View your plans and invoices</p>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
              Manage <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}