import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { siteConfig } from '../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('Previous Year Papers'),
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