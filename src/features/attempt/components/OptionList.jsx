'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setAnswer, toggleAnswer } from '../store/attemptSlice';
import { MathText } from '../../../components/common/MathText';

export default function OptionList({ question }) {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(state => state.attempt.responses[question.id]?.selected) || [];
  
  const isMSQ = question.type === 'MSQ';

  const handleOptionClick = (optionId) => {
    if (isMSQ) {
      dispatch(toggleAnswer({ qId: question.id, value: optionId }));
    } else {
      dispatch(setAnswer({ qId: question.id, value: optionId, isNumeric: false }));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {question.options?.map((opt, idx) => {
        const isSelected = selected.includes(opt.id);
        const letter = String.fromCharCode(65 + idx); // A, B, C, D...
        
        return (
          <label 
            key={opt.id}
            className={`
              relative flex items-start gap-4 p-4 rounded-md border-2 cursor-pointer transition-all
              ${isSelected 
                ? 'border-exam-accent bg-exam-accent-light text-exam-accent' 
                : 'border-exam-border bg-white text-exam-text hover:border-exam-accent/30 hover:bg-exam-bg'
              }
            `}
          >
            <input
              type={isMSQ ? "checkbox" : "radio"}
              name={`q-${question.id}`}
              value={opt.id}
              checked={isSelected}
              onChange={() => handleOptionClick(opt.id)}
              className="sr-only"
            />
            
            <div className={`
              mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center font-bold text-sm border-2 transition-colors
              ${isMSQ ? 'rounded-sm' : 'rounded-full'}
              ${isSelected 
                ? 'border-exam-accent bg-exam-accent text-white' 
                : 'border-slate-300 text-slate-500 bg-white'
              }
            `}>
              {letter}
            </div>

            <div className="flex-1 mt-0.5">
              <MathText text={opt.text} className="text-[16px] leading-[1.5]" />
            </div>
          </label>
        );
      })}
    </div>
  );
}
