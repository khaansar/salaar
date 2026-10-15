import StudentShell from '../../../../components/student/StudentShell';

export const metadata = {
  title: 'Test Result',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultLayout({ children }) {
  return (
    <div className="print-dashboard-shell">
      <StudentShell>{children}</StudentShell>
    </div>
  );
}