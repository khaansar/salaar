'use client';

import { useAppSelector } from '../../../hooks/useAppSelector';
import { MathText } from '../../../components/common/MathText';
import { QuestionImages } from '../../../components/common/QuestionImages';
import OptionList from './OptionList';
import NumericAnswer from './NumericAnswer';

export default function QuestionPanel() {
  const currentQuestionId = useAppSelector(
    (state) => state.attempt.ui.currentQuestionId
  );

  const question = useAppSelector(
    (state) => state.attempt.questions[currentQuestionId]
  );

  const sections = useAppSelector((state) => state.attempt.sections);

  if (!question) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-exam-text-muted">
        Select a question from the palette
      </div>
    );
  }

  let globalIndex = 0;

  for (const section of sections) {
    const index = section.questionIds?.indexOf(currentQuestionId);

    if (index !== undefined && index !== -1) {
      globalIndex = index + 1;
      break;
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-exam-bg p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-exam-border bg-exam-panel shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-exam-border bg-exam-bg/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-exam-text">
              Question {globalIndex}
            </h2>

            <span className="rounded-sm bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              {question.type}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-emerald-600">
              +{question.marks}
            </span>

            {question.negativeMarks > 0 && (
              <span className="text-rose-600">
                -{question.negativeMarks}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <MathText
            text={question.text}
            className="select-none text-[17px] leading-[1.6] text-exam-text"
          />

          <QuestionImages
            images={question.questionImages}
            className="mt-4"
            imageClassName="max-h-[32rem]"
          />

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