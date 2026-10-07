import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';

export const metadata = {
  title: 'Analytics | ClearIt',
};

export default function Page() {
  return (
    <StudentShell>
      <ComingSoon
        title="Analytics"
        description="Detailed performance analytics are on their way."
      />
    </StudentShell>
  );
}
