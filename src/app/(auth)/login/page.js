import { LoginForm } from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[440px]">
        <Suspense fallback={<div className="text-center p-4">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
