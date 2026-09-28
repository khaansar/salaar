'use client';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { MathText } from '../../../components/common/MathText';
import OptionList from './OptionList';
import NumericAnswer from './NumericAnswer';

export default function QuestionPanel() {
  const currentQuestionId = useAppSelector(state => state.attempt.ui.currentQuestionId);
  const question = useAppSelector(state => state.attempt.questions[currentQuestionId]);
  
  const sections = useAppSelector(state => state.attempt.sections);
  
  if (!question) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-exam-text-muted">
        Select a question from the palette
      </div>
    );
  }

  // Determine question index just for display
  let globalIndex = 0;
  for (const s of sections) {
    const idx = s.questionIds?.indexOf(currentQuestionId);
    if (idx !== undefined && idx !== -1) {
      globalIndex = idx + 1; // 1-indexed within section for now, or global if we count across
      break;
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-exam-bg p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-exam-panel border border-exam-border rounded-lg shadow-sm overflow-hidden">
        {/* Question Header */}
        <div className="px-6 py-4 border-b border-exam-border flex flex-wrap items-center justify-between gap-4 bg-exam-bg/30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-exam-text">Question {globalIndex}</h2>
            <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 bg-slate-200 text-slate-700 rounded-sm uppercase">
              {question.type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-emerald-600">+{question.marks}</span>
            {question.negativeMarks > 0 && (
              <span className="text-rose-600">-{question.negativeMarks}</span>
            )}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6">
          <MathText text={question.text} className="text-[17px] leading-[1.6] text-exam-text select-none" />
          
          <div className="mt-8">
            {question.type === 'NAT' ? (
              <NumericAnswer questionId={question.id} />
            ) : (
              <OptionList question={question} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
