import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { APP_NAME } from '../../constants/brand';

export const metadata = {
  title: `Pricing | ${APP_NAME}`,
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
