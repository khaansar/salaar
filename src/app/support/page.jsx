import StudentShell from '@/components/student/StudentShell';
import { siteConfig } from '@/config/site';
import HelpSupportPage from '@/features/faqs/HalpSupportPage';

export const metadata = {
  title: siteConfig.formatTitle('Help & Support'),
  description: 'Manage your profile details, target exam preferences, and account security.',
};

export default function SettingsRoute() {
  return (
    <StudentShell>
      <HelpSupportPage />
    </StudentShell>
  );
}
