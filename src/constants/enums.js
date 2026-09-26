// Mirrors enums exposed by the test-service OpenAPI schema.
// Keep these in sync with the backend — do not invent values that
// the API does not accept.

export const TEST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

export const TEST_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const QUESTION_TYPE = {
  MCQ: 'MCQ',
  MULTI_CORRECT: 'MULTI_CORRECT',
  NUMERICAL: 'NUMERICAL',
  SUBJECTIVE: 'SUBJECTIVE',
};

export const QUESTION_TYPE_OPTIONS = [
  { value: 'MCQ', label: 'Single Correct (MCQ)' },
  { value: 'MULTI_CORRECT', label: 'Multiple Correct' },
  { value: 'NUMERICAL', label: 'Numerical' },
  { value: 'SUBJECTIVE', label: 'Subjective' },
];

export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
};

export const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

export const STATUS_BADGE_STYLES = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARCHIVED: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const DIFFICULTY_BADGE_STYLES = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HARD: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const QUESTION_TYPE_BADGE_STYLES = {
  MCQ: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  MULTI_CORRECT: 'bg-violet-50 text-violet-700 border-violet-200',
  NUMERICAL: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  SUBJECTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
};

// Default set of translation languages offered when authoring content.
// Admins can still type any language code they need — this is just a
// convenience list, not a backend-enforced constraint.
export const COMMON_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'bn', label: 'Bengali' },
];
