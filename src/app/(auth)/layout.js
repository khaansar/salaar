export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-900">
      {children}
    </div>
  );
}
