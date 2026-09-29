import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';

export const metadata = {
  title: 'Mock Tests | TestHub',
};

export default function Page() {
  return (
    <StudentShell>
      <ComingSoon
        title="Mock Tests"
        description="A browsable list of every mock test is on its way. For now, open a test series to find and start a test."
      />
    </StudentShell>
  );
}
