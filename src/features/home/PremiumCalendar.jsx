'use client';
import { useState, useMemo } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Hexagon } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useGetCalendarAnalyticsQuery } from '../../store/userApi';

export default function PremiumCalendar() {
  const { user } = useAppSelector((state) => state.auth);
  
  const todayDate = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // API is 1-indexed for month

  const { data, isLoading } = useGetCalendarAnalyticsQuery(
    { year, month },
    { skip: !user }
  );

  const activeDays = data?.activeDays || [];
  const currentStreak = data?.currentStreak || 0;
  const longestStreak = data?.longestStreak || 0;

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const grid = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const gridArray = [];
    let week = Array(7).fill(null);
    let currentDayOfWeek = firstDayOfWeek;

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = todayDate.getFullYear() === year && todayDate.getMonth() + 1 === month && todayDate.getDate() === day;
      const isChecked = activeDays.includes(day);
      // Optional: Add dot for missed days in the past
      const isPast = new Date(year, month - 1, day) < new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()) && !isToday;
      
      week[currentDayOfWeek] = {
        day,
        checked: isChecked,
        today: isToday,
        dot: isPast && !isChecked
      };

      currentDayOfWeek++;
      if (currentDayOfWeek === 7) {
        gridArray.push(week);
        week = Array(7).fill(null);
        currentDayOfWeek = 0;
      }
    }
    
    if (currentDayOfWeek !== 0) {
      gridArray.push(week);
    }
    
    return gridArray;
  }, [year, month, activeDays, todayDate]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month, 1));

  const monthShortName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' }).toUpperCase();
  const todayDay = todayDate.getDate();

  if (!user) return null;

  const calendarContent = (
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm w-full max-w-[340px] border border-slate-200 dark:border-slate-800">
      {/* Floating Hexagon Badge */}
      <div className="absolute -top-7 right-4 flex flex-col items-center justify-center pointer-events-none drop-shadow-sm dark:drop-shadow-xl">
        <div className="relative flex h-[72px] w-[72px] items-center justify-center">
          <Hexagon className="absolute h-full w-full fill-slate-50 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
          <Hexagon className="absolute h-[85%] w-[85%] fill-indigo-50 dark:fill-indigo-900/20 stroke-indigo-200 dark:stroke-indigo-800/50" strokeWidth={2} />
          <Hexagon className="absolute h-[70%] w-[70%] fill-white dark:fill-slate-950 stroke-indigo-600 dark:stroke-indigo-500" strokeWidth={1.5} />
          <div className="relative z-10 text-center leading-[1.1] mt-1">
            <span className="block text-[22px] font-bold text-indigo-600 dark:text-indigo-400">{todayDay}</span>
            <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{monthShortName}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pr-20">
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-wide">
            {currentStreak} Day Streak
          </span>
        </div>
        <div className="flex gap-5 text-slate-400 dark:text-slate-500">
          <ChevronLeft onClick={handlePrevMonth} size={16} className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
          <ChevronRight onClick={handleNextMonth} size={16} className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 mb-4 text-center text-[13px] font-medium text-slate-400 dark:text-slate-500">
        {daysOfWeek.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 gap-y-4 gap-x-1 mb-2 ${isLoading ? 'opacity-50' : ''}`}>
        {grid.flat().map((item, idx) => (
          <div key={idx} className="relative flex flex-col items-center justify-center h-8">
            {item ? (
              <>
                {item.checked ? (
                  <CheckCircle2 size={26} strokeWidth={2.5} className="text-indigo-600 dark:text-indigo-500" />
                ) : item.today ? (
                  <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-[13px] font-medium text-white shadow-md shadow-indigo-600/20">
                    {item.day}
                  </div>
                ) : (
                  <span className={`text-[13px] font-medium ${item.dot ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.day}
                  </span>
                )}
                {item.dot && !item.today && (
                  <div className="absolute -bottom-2 h-1 w-1 rounded-full bg-rose-500 dark:bg-rose-500/80"></div>
                )}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Wrapper - Floats Right */}
      <div className="hidden xl:block float-right w-[340px] ml-8 mb-8 relative z-10 mt-2">
        {calendarContent}
      </div>
      
      {/* Mobile Wrapper - Sits in normal flow */}
      <div className="xl:hidden w-full max-w-[340px] mx-auto mb-10">
        {calendarContent}
      </div>
    </>
  );
}
