import StudentShell from '../../../../components/student/StudentShell';

export default function ResultLayout({
  children,
}) {
  return (
    <div className="print-dashboard-shell">
      <StudentShell>
        {children}
      </StudentShell>
    </div>
  );
}