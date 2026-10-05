'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
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
  const { loginStatus, error: serverError } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

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
      await dispatch(loginUser({ email, password })).unwrap();
      const destination = nextParam || '/';
      router.push(destination);
      router.refresh();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        {/* Top right "Sign Up" link inside the card */}
        <div className="absolute top-8 right-8 text-sm hidden sm:block">
          <span className="text-slate-500">Don't have an account? </span>
          <Link href="/signup" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Sign Up &rarr;
          </Link>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1">Welcome Back</h2>
            <p className="text-[14px] text-slate-500">
              Login to continue your exam preparation journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-3">
                <span className="font-medium">
                  {typeof serverError === 'string' ? serverError : 'Login failed. Please try again.'}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <Input
                id="email"
                label="Email or Phone Number"
                type="email"
                placeholder="Enter your email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                className="h-12"
                leftIcon={<Mail size={18} />}
              />
              <PasswordInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="h-12"
                leftIcon={<Lock size={18} />}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Checkbox
                id="remember-me"
                label={<span className="text-[13px] font-medium text-slate-600">Remember me</span>}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link href="/forgot-password" className="text-[13px] font-medium text-brand-600 hover:text-brand-800 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loginStatus === 'loading'}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white transition-all hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loginStatus === 'loading' ? 'Signing in...' : (
                <>
                  Login <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-medium uppercase tracking-wider">OR</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" className="flex justify-center items-center gap-2 h-11 px-4 border border-slate-200 rounded-xl bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            <button type="button" className="flex justify-center items-center gap-2 h-11 px-4 border border-slate-200 rounded-xl bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <path fill="#f25022" d="M0 0h10v10H0z"/>
                <path fill="#7fba00" d="M11 0h10v10H11z"/>
                <path fill="#00a4ef" d="M0 11h10v10H0z"/>
                <path fill="#ffb900" d="M11 11h10v10H11z"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
