import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { APP_NAME } from '../../constants/brand';

export const metadata = {
  title: `FAQs | ${APP_NAME}`,
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
