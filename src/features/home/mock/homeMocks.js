export const CATEGORIES_MOCK = [
  { id: '1', name: 'Engineering', slug: 'engineering', testCount: 120, icon: 'Settings', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: '2', name: 'Medical', slug: 'medical', testCount: 80, icon: 'Stethoscope', color: 'text-red-500', bg: 'bg-red-50' },
  { id: '3', name: 'Government Exams', slug: 'government', testCount: 150, icon: 'Landmark', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: '4', name: 'School Exams', slug: 'school', testCount: 60, icon: 'BookOpen', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: '5', name: 'Aptitude', slug: 'aptitude', testCount: 90, icon: 'Sigma', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: '6', name: 'Computer Science', slug: 'cs', testCount: 100, icon: 'Monitor', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: '7', name: 'Data Structures', slug: 'dsa', testCount: 70, icon: 'Network', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: '8', name: 'Operating Systems', slug: 'os', testCount: 60, icon: 'Cpu', color: 'text-pink-500', bg: 'bg-pink-50' },
];

export const POPULAR_SERIES_MOCK = [
  {
    id: 's1',
    title: 'GATE 2025 Full Length Tests',
    badge: 'Popular',
    testCount: 12,
    durationMinutes: 180, // 3 hrs
    avgRating: 4.8,
    thumbnailUrl: '/images/home/series-gate.webp',
  },
  {
    id: 's2',
    title: 'Computer Science Mock Series',
    badge: 'New',
    testCount: 8,
    durationMinutes: 180,
    avgRating: 4.5,
    thumbnailUrl: '/images/home/series-cs.webp',
  },
  {
    id: 's3',
    title: 'Operating Systems Practice Series',
    badge: null,
    testCount: 6,
    durationMinutes: 180,
    avgRating: 4.7,
    thumbnailUrl: '/images/home/series-os.webp',
  },
  {
    id: 's4',
    title: 'Data Structures Practice Series',
    badge: null,
    testCount: 10,
    durationMinutes: 120, // 2 hrs
    avgRating: 4.9,
    thumbnailUrl: '/images/home/series-ds.webp',
  },
];

export const FEATURED_TESTS_MOCK = [
  {
    id: 'dfc9d8e2-33a2-4f66-b0c7-5c71278616a8',
    title: 'My Custom Admin Test',
    categoryName: 'Engineering',
    durationMinutes: 180,
    totalMarks: 100,
  },
  {
    id: 't2',
    title: 'Operating Systems - Sectional',
    categoryName: 'Computer Science',
    durationMinutes: 45,
    totalMarks: 25,
  },
  {
    id: 't3',
    title: 'Quantitative Aptitude - Mock 2',
    categoryName: 'Aptitude',
    durationMinutes: 180,
    totalMarks: 100,
  },
  {
    id: 't4',
    title: 'Data Structures - Mock 1',
    categoryName: 'Engineering',
    durationMinutes: 180,
    totalMarks: 100,
  },
];

export const CONTINUE_ATTEMPT_MOCK = {
  id: 'a1',
  testId: 't1',
  testTitle: 'Algorithms - Mock 1',
  progressPercentage: 45,
  startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
};

export const STREAK_MOCK = {
  currentStreak: 4,
  maxStreak: 12,
  last7Days: [
    { day: 'M', completed: true },
    { day: 'T', completed: true },
    { day: 'W', completed: false },
    { day: 'T', completed: true },
    { day: 'F', completed: true },
    { day: 'S', completed: true },
    { day: 'S', completed: false },
  ]
};
