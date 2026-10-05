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
  const [activeTab, setActiveTab] = useState('Student');
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
      {/* Top right "Sign Up" link outside the card */}
      <div className="absolute top-8 right-8 text-sm hidden md:block">
        <span className="text-slate-500">Don't have an account? </span>
        <Link href="/signup" className="text-brand-600 font-semibold hover:text-brand-700">
          Sign Up &rarr;
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1">Welcome Back</h2>
            <p className="text-[14px] text-slate-500">
              Login to continue your exam preparation journey.
            </p>
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
            {['Student', 'Educator', 'Admin'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
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
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.475 2 2 6.475 2 12c0 4.42 2.862 8.163 6.838 9.488.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.513.463-3.162-.612-3.362-1.175-.113-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.013 1.35 1.538 1.025.9 1.512 2.338 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.025A9.564 9.564 0 0112 6.8c.85.004 1.705.115 2.5.338 1.913-1.3 2.75-1.025 2.75-1.025.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.737 0 .262.188.575.688.475A10.005 10.005 0 0022 12c0-5.525-4.475-10-10-10z" fill="#24292F"/>
              </svg>
              Continue with GitHub
            </button>
          </div>
        </div>

        {/* Lower Section inside the same container */}
        <div className="bg-slate-50 p-6 sm:px-8 border-t border-slate-100 text-center">
          <h3 className="font-semibold text-slate-900 mb-1">New to Baahubali?</h3>
          <p className="text-[13px] text-slate-500 mb-4">Join 100K+ aspirants and start your preparation today.</p>
          <Link href="/signup" className="inline-flex items-center justify-center w-full h-11 border border-brand-300 bg-white shadow-sm text-brand-600 font-semibold text-[14px] rounded-xl hover:bg-slate-50 transition-colors">
            Create an Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
