export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-slate-950 flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-900 dark:text-slate-100">
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}