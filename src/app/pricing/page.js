import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';

export const metadata = {
  title: 'Pricing | Baahubali',
};

export default function Page() {
  return (
    <StudentShell>
      <ComingSoon
        title="Pricing"
        description="Plans and pricing will be available here soon."
      />
    </StudentShell>
  );
}