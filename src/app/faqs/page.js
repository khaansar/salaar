import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';

export const metadata = {
  title: 'FAQs | Baahubali',
};

export default function Page() {
  return (
    <StudentShell>
      <ComingSoon
        title="FAQs"
        description="Answers to common questions will be available here soon."
      />
    </StudentShell>
  );
}