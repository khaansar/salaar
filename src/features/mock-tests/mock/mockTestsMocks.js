// TODO: replace with real API data once a public tests-list endpoint exists.
// Everything on /tests except "Popular Test Series" (real API) is driven by this file.

export const EXAM_CATEGORIES = [
  { slug: 'government', name: 'Government Exams', desc: 'SSC, UPSC, State PSC and more', examCount: 8, icon: 'Building2', tone: 'text-emerald-600' },
  { slug: 'banking', name: 'Banking Exams', desc: 'IBPS, SBI, RBI and more', examCount: 5, icon: 'Landmark', tone: 'text-amber-500' },
  { slug: 'railway', name: 'Railway Exams', desc: 'RRB, RPF and more', examCount: 4, icon: 'TrainFront', tone: 'text-rose-500' },
  { slug: 'teaching', name: 'Teaching Exams', desc: 'CTET, TET, B.Ed and more', examCount: 4, icon: 'GraduationCap', tone: 'text-blue-600' },
  { slug: 'state', name: 'State Exams', desc: 'Various State PSC exams', examCount: 6, icon: 'MapPin', tone: 'text-blue-500' },
  { slug: 'defence', name: 'Defence Exams', desc: 'NDA, CDS, AFCAT and more', examCount: 3, icon: 'ShieldCheck', tone: 'text-emerald-600' },
  { slug: 'engineering', name: 'Engineering Exams', desc: 'GATE, ESE and more', examCount: 2, icon: 'Settings', tone: 'text-indigo-600' },
  { slug: 'medical', name: 'Medical Exams', desc: 'NEET, AIIMS and more', examCount: 2, icon: 'Stethoscope', tone: 'text-indigo-600' },
];

export const EXAMS = [
  { name: 'SSC CGL', cat: 'government' },
  { name: 'SSC CHSL', cat: 'government' },
  { name: 'SSC MTS', cat: 'government' },
  { name: 'Railway RRB', cat: 'railway' },
  { name: 'Banking (IBPS)', cat: 'banking' },
  { name: 'Banking (SBI)', cat: 'banking' },
  { name: 'UPSC', cat: 'government' },
  { name: 'State PSC', cat: 'state' },
  { name: 'NDA', cat: 'defence' },
  { name: 'CTET', cat: 'teaching' },
];

export const TYPES = [
  { value: 'full', label: 'Full Length Tests', short: 'Full Length Test' },
  { value: 'topic', label: 'Topic Tests', short: 'Topic Test' },
  { value: 'sectional', label: 'Sectional Tests', short: 'Sectional Test' },
  { value: 'pyp', label: 'Previous Year Papers', short: 'Previous Year Paper' },
];

export const LANGUAGES = ['English', 'Hindi', 'Bilingual'];

const SPEC = {
  full: { questions: 100, minutes: 60, names: ['Full Test 1', 'Full Test 2', 'Full Test 3'] },
  topic: { questions: 25, minutes: 30, names: ['Quantitative Aptitude', 'Reasoning Ability'] },
  sectional: { questions: 50, minutes: 30, names: ['General Studies'] },
  pyp: { questions: 100, minutes: 60, names: ['Previous Year Paper'] },
};

let n = 0;
export const TESTS = EXAMS.flatMap((exam) =>
  Object.entries(SPEC).flatMap(([type, s]) =>
    s.names.map((name) => {
      n += 1;
      return {
        id: `mock-${n}`, // TODO: real ids needed for /tests/[id]/instructions
        series: `${exam.name} ${type === 'pyp' ? 2024 : 2025}`,
        name,
        exam: exam.name,
        cat: exam.cat,
        type,
        questions: s.questions,
        minutes: s.minutes,
        languages: n % 4 === 0 ? ['English'] : ['English', 'Hindi'],
        price: n % 3 === 1 ? 49 : 0,
      };
    })
  )
);