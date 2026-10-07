import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { APP_NAME } from '../../constants/brand';

export const metadata = {
  title: `Previous Year Papers | ${APP_NAME}`,
};

export default function Page() {
  return (
    <StudentShell>
      <ComingSoon
        title="Previous Year Papers"
        description="Previous year papers for every exam are on their way."
      />
    </StudentShell>
  );
}
