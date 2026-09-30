'use client';

import StudentShell from '../../components/student/StudentShell';
import ProfilePage from '../../components/profile/ProfilePage';

export default function ProfileRoute() {
  return (
    <StudentShell>
      <ProfilePage />
    </StudentShell>
  );
}