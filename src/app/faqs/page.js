import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { siteConfig } from '../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('FAQs'),
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