import StudentShell from '../../components/student/StudentShell';
import ComingSoon from '../../components/common/ComingSoon';
import { siteConfig } from '../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('Pricing'),
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