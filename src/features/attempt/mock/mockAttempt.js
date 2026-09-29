export const MOCK_ATTEMPT_DATA = {
  attempt: {
    id: 'a1',
    testId: 't1',
    title: 'GATE 2025 Mock Test 1',
    type: 'Full Length Test',
    status: 'IN_PROGRESS',
    remainingSeconds: 10800, // 3 hours
  },
  sections: [
    {
      id: 's1',
      name: 'General Aptitude',
      questionIds: ['q1', 'q2', 'q3'],
    },
    {
      id: 's2',
      name: 'Computer Science',
      questionIds: ['q4', 'q5'],
    }
  ],
  questions: {
    'q1': {
      id: 'q1',
      type: 'MCQ',
      text: 'If $x^2 + y^2 = 25$ and $x = 3$, what is the positive value of $y$?',
      options: [
        { id: 'o1', text: '4' },
        { id: 'o2', text: '5' },
        { id: 'o3', text: '6' },
        { id: 'o4', text: '7' }
      ],
      marks: 1,
      negativeMarks: 0.33,
    },
    'q2': {
      id: 'q2',
      type: 'NAT',
      text: 'Calculate the value of $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$',
      marks: 2,
      negativeMarks: 0,
    },
    'q3': {
      id: 'q3',
      type: 'MSQ',
      text: 'Which of the following are prime numbers?',
      options: [
        { id: 'o1', text: '2' },
        { id: 'o2', text: '4' },
        { id: 'o3', text: '5' },
        { id: 'o4', text: '9' }
      ],
      marks: 2,
      negativeMarks: 0,
    },
    'q4': {
      id: 'q4',
      type: 'MCQ',
      text: 'What is the time complexity of quicksort in the worst case?',
      options: [
        { id: 'o1', text: '$O(n)$' },
        { id: 'o2', text: '$O(n \\log n)$' },
        { id: 'o3', text: '$O(n^2)$' },
        { id: 'o4', text: '$O(1)$' }
      ],
      marks: 1,
      negativeMarks: 0.33,
    },
    'q5': {
      id: 'q5',
      type: 'MCQ',
      text: 'Which scheduling algorithm is non-preemptive?',
      options: [
        { id: 'o1', text: 'Round Robin' },
        { id: 'o2', text: 'Shortest Remaining Time First' },
        { id: 'o3', text: 'First Come First Serve' },
        { id: 'o4', text: 'Multilevel Queue' }
      ],
      marks: 1,
      negativeMarks: 0.33,
    }
  },
  responses: {
    // Empty initially
  }
};
