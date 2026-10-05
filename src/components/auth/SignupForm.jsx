'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Checkbox } from '../ui/Checkbox';
import { isValidEmail, validatePassword } from '../../utils/validators';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { registerUser } from '../../store/slices/authSlice';

export function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useAppDispatch();
  const { registrationStatus, error: serverError } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const validate = () => {
    const newErrors = {};
    if (!fullName) newErrors.fullName = 'Required';
    if (!email) {
      newErrors.email = 'Required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email';
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'Must accept terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const names = fullName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');
      
      const resultAction = await dispatch(registerUser({ 
        firstName, 
        lastName, 
        email, 
        password 
      })).unwrap();
      
      if (resultAction?.role === 'ADMIN') {
        router.push('/admin-dashboard');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
        {/* Top right Login link inside the card */}
        <div className="absolute top-8 right-8 text-sm hidden sm:block">
          <span className="text-slate-500">Already have an account? </span>
          <Link href="/login" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Login &rarr;
          </Link>
        </div>

        <div className="p-6 sm:p-8 sm:pr-48">
          <div className="mb-6">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1">Create Your Account</h2>
            <p className="text-[14px] text-slate-500">
              Join Baahubali and start your exam preparation journey today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
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

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-medium uppercase tracking-wider">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-3">
                <span className="font-medium">
                  {typeof serverError === 'string' ? serverError : 'Registration failed. Please try again.'}
                </span>
              </div>
            )}

            <Input
              id="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              className="h-12"
              leftIcon={<User size={18} />}
            />
            
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              className="h-12"
              leftIcon={<Mail size={18} />}
            />

            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
              leftIcon={<Phone size={18} />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordInput
                id="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="h-12"
                leftIcon={<Lock size={18} />}
              />
              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                className="h-12"
                leftIcon={<Lock size={18} />}
              />
            </div>

            <div>
              <label htmlFor="targetExam" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Select Your Target Exam(s) (Optional)
              </label>
              <select
                id="targetExam"
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
              >
                <option value="">Search and select exams (e.g., SSC CGL, Banking, Railway)</option>
                <option value="ssc">SSC CGL</option>
                <option value="banking">Banking (IBPS/SBI)</option>
                <option value="railway">Railway (RRB)</option>
                <option value="upsc">UPSC</option>
                <option value="state">State PSC</option>
              </select>
            </div>

            <div className="pt-2 pb-2">
              <Checkbox
                id="terms"
                label={
                  <span className="text-[13px] font-medium text-slate-600">
                    I agree to the <Link href="/terms" className="text-brand-600 hover:text-brand-800 transition-colors">Terms of Service</Link> and <Link href="/privacy" className="text-brand-600 hover:text-brand-800 transition-colors">Privacy Policy</Link>
                  </span>
                }
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                error={errors.terms}
              />
            </div>

            <button 
              type="submit" 
              disabled={registrationStatus === 'loading'}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-medium text-white transition-all hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {registrationStatus === 'loading' ? 'Creating account...' : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lower Section inside the same container */}
        <div className="bg-slate-50 p-5 sm:px-8 border-t border-slate-100 flex items-center justify-center gap-3">
          <ShieldCheck className="text-brand-500" size={24} />
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 text-sm">Your data is safe with us</h3>
            <p className="text-xs text-slate-500">We use industry-standard security measures to protect your information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
