'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setAnswer } from '../store/attemptSlice';

export default function NumericAnswer({ questionId }) {
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => state.attempt.responses[questionId]?.numeric) || '';

  const handleKeypad = (char) => {
    let newVal = value;
    if (char === 'BACKSPACE') {
      newVal = newVal.slice(0, -1);
    } else if (char === 'CLEAR') {
      newVal = '';
    } else if (char === '-') {
      // Toggle negative
      if (newVal.startsWith('-')) newVal = newVal.substring(1);
      else newVal = '-' + newVal;
    } else {
      // Only one decimal point allowed
      if (char === '.' && newVal.includes('.')) return;
      newVal += char;
    }
    
    dispatch(setAnswer({ qId: questionId, value: newVal, isNumeric: true }));
  };

  const keys = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '.', '-'
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-8">
      {/* Input Display */}
      <div className="flex-1">
        <label className="block text-sm font-semibold text-exam-text-muted mb-2 uppercase tracking-wider">
          Your Answer
        </label>
        <div className="w-full max-w-sm h-14 px-4 bg-white border-2 border-exam-accent/30 rounded-md shadow-inner flex items-center justify-end overflow-hidden">
          <span className="font-mono text-2xl font-bold tracking-widest text-exam-text">
            {value}
            <span className="animate-pulse ml-1 inline-block w-2.5 h-6 bg-exam-accent align-middle"></span>
          </span>
        </div>
        <p className="mt-3 text-xs text-exam-text-muted">
          Use the on-screen keypad to enter your answer. Do not use your physical keyboard.
        </p>
      </div>

      {/* On-screen Keypad */}
      <div className="w-[240px] shrink-0 select-none">
        <div className="grid grid-cols-3 gap-2">
          {keys.map(k => (
            <button
              key={k}
              type="button"
              onClick={() => handleKeypad(k)}
              className="h-12 bg-white border border-slate-200 hover:border-exam-accent hover:bg-exam-accent-light rounded text-lg font-bold text-exam-text shadow-sm transition-colors focus:outline-none"
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeypad('BACKSPACE')}
            className="h-12 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-sm font-semibold text-exam-text shadow-sm transition-colors col-span-2 focus:outline-none flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
          </button>
          <button
            type="button"
            onClick={() => handleKeypad('CLEAR')}
            className="h-12 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded text-sm font-bold shadow-sm transition-colors focus:outline-none"
          >
            CLR
          </button>
        </div>
      </div>
    </div>
  );
}
