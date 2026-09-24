'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Checkbox } from '../ui/Checkbox';
import { isValidEmail } from '../../utils/validators';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginUser } from '../../store/slices/authSlice';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  
  const dispatch = useAppDispatch();
  const { status, error: serverError } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email';
    }
    if (!password) {
      newErrors.password = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const resultAction = await dispatch(loginUser({ email, password })).unwrap();
      
      if (resultAction?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    } catch (err) {
      // Error handled by Redux state
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="p-3 bg-red-50 text-red-600 text-[13px] rounded-md border border-red-100 flex items-start gap-2">
            <span>{serverError}</span>
          </div>
        )}

        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="remember-me"
            label={<span className="text-[14px] text-slate-600">Remember me</span>}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          
          <Link href="/forgot-password" className="text-[14px] font-medium text-slate-900 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[6px] h-10 text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#FAFAFA] text-slate-400">OR CONTINUE WITH</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button type="button" className="w-full inline-flex justify-center items-center gap-2 h-10 px-4 border border-slate-200 rounded-[6px] bg-white text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button type="button" className="w-full inline-flex justify-center items-center gap-2 h-10 px-4 border border-slate-200 rounded-[6px] bg-white text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 21 21">
              <path fill="#f25022" d="M0 0h10v10H0z"/>
              <path fill="#7fba00" d="M11 0h10v10H11z"/>
              <path fill="#00a4ef" d="M0 11h10v10H0z"/>
              <path fill="#ffb900" d="M11 11h10v10H11z"/>
            </svg>
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
