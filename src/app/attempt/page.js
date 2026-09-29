import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';

export const metadata = {
  title: 'Previous Attempts | TestHub',
};

export default function Page() {
  return (
    <StudentShell>
      <ComingSoon
        title="Previous Attempts"
        description="Your attempt history will appear here once results processing is available."
      />
    </StudentShell>
  );
}
