'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '../../hooks/useAppSelector';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;
  
  // Use user's first name if available, otherwise just 'there'
  const name = user?.firstName || 'there';

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#eef2ff] to-[#f3e8ff] dark:from-indigo-950/40 dark:to-purple-900/40 pt-12 pb-16 lg:pt-16 lg:pb-20 rounded-3xl mb-8 border border-white/50 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl mb-6">
              {isAuthenticated ? (
                <span className="block xl:inline">Welcome back, {name}!</span>
              ) : (
                <>
                  <span className="block xl:inline">Practice Smarter.</span>{' '}
                  <span className="block text-[#5e43f3] dark:text-indigo-400 xl:inline">Score Higher.</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-medium">
              High quality mock tests, detailed solutions and performance analytics to help you achieve your goals.
            </p>
            
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
              <Link
                href="/test-series"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-[#5e43f3] hover:bg-[#4d36c6] shadow-sm transition-colors"
              >
                Explore Test Series
                <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
              </Link>
              {isAuthenticated && (
                <Link
                  href="/attempts"
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 text-base font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors backdrop-blur"
                >
                  Previous Attempts
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 text-base font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors backdrop-blur"
                >
                  Sign up free
                </Link>
              )}
            </div>
          </div>
          
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center justify-end">
            <div className="relative w-full lg:w-[120%] lg:-mr-10 aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/home/hero-student.webp"
                alt="Student studying at laptop"
                fill
                priority
                className="object-contain object-right"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
