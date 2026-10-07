import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { APP_NAME } from '../../constants/brand';

export const metadata = {
  title: `Analytics | ${APP_NAME}`,
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
