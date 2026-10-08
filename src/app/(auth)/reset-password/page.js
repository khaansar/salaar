'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../../store/slices/authSlice';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { resetPasswordStatus, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (resetPasswordStatus === 'succeeded') {
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [resetPasswordStatus, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!token) {
      setValidationError('Invalid or missing reset token.');
      return;
    }
    
    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    dispatch(resetPassword({ token, newPassword }));
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>
        
        {resetPasswordStatus === 'succeeded' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 text-center">
            Password has been reset successfully. Redirecting to login...
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="text-red-500 text-sm mb-2">{validationError || error}</div>
            )}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={resetPasswordStatus === 'loading'}
              className="w-full bg-blue-600 text-white h-10 px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {resetPasswordStatus === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
