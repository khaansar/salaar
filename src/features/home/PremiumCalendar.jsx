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
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm w-full md:w-[310px] h-full border border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Floating Hexagon Badge */}
      <div className="absolute -top-7 right-3 flex flex-col items-center justify-center pointer-events-none drop-shadow-sm dark:drop-shadow-xl">
        <div className="relative flex h-[68px] w-[68px] items-center justify-center">
          <Hexagon className="absolute h-full w-full fill-slate-50 dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
          <Hexagon className="absolute h-[85%] w-[85%] fill-indigo-50 dark:fill-indigo-900/20 stroke-indigo-200 dark:stroke-indigo-800/50" strokeWidth={2} />
          <Hexagon className="absolute h-[70%] w-[70%] fill-white dark:fill-slate-950 stroke-indigo-600 dark:stroke-indigo-500" strokeWidth={1.5} />
          <div className="relative z-10 text-center leading-[1.1] mt-1">
            <span className="block text-[20px] font-bold text-indigo-600 dark:text-indigo-400">{todayDay}</span>
            <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{monthShortName}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 pr-16">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-slate-900 dark:text-white tracking-wide">
            {currentStreak} Day Streak
          </span>
        </div>
        <div className="flex gap-4 text-slate-400 dark:text-slate-500">
          <ChevronLeft onClick={handlePrevMonth} size={16} className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
          <ChevronRight onClick={handleNextMonth} size={16} className="cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 mb-2 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        {daysOfWeek.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 gap-y-1.5 gap-x-1 mb-1 ${isLoading ? 'opacity-50' : ''}`}>
        {grid.flat().map((item, idx) => (
          <div key={idx} className="relative flex flex-col items-center justify-center h-6">
            {item ? (
              <>
                {item.checked ? (
                  <CheckCircle2 size={24} strokeWidth={2.5} className="text-indigo-600 dark:text-indigo-500" />
                ) : item.today ? (
                  <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-xs font-medium text-white shadow-md shadow-indigo-600/20">
                    {item.day}
                  </div>
                ) : (
                  <span className={`text-xs font-medium ${item.dot ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.day}
                  </span>
                )}
                {item.dot && !item.today && (
                  <div className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-rose-500 dark:bg-rose-500/80"></div>
                )}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Invisible spacer to perfectly align the calendar's top border with the category cards' top border */}
      <div className="h-[28px] mb-4 invisible">Spacer</div>
      {calendarContent}
    </div>
  );
}
