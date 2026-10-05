import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { siteConfig } from '../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('Analytics'),
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