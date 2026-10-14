import StudentShell from '@/components/student/StudentShell';
import AccountSettingsPage from '@/components/settings/AccountSettingsPage';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: siteConfig.formatTitle('Account Settings'),
  description: 'Manage your profile details, target exam preferences, and account security.',
};

export default function SettingsRoute() {
  return (
    <StudentShell>
      <AccountSettingsPage />
    </StudentShell>
  );
}
