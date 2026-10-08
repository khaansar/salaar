'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../../store/slices/authSlice';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const { forgotPasswordStatus, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      dispatch(forgotPassword(email));
    }
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-6">Enter your email address and we&apos;ll send you a link to reset your password.</p>
        
        {forgotPasswordStatus === 'succeeded' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
            If the account exists, a password reset email has been sent. Please check your inbox.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {forgotPasswordStatus === 'failed' && error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={forgotPasswordStatus === 'loading'}
              className="w-full bg-blue-600 text-white h-10 px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {forgotPasswordStatus === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}