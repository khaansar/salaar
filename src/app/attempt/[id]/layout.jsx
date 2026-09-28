export default function AttemptLayout({ children }) {
  // Bare layout: no navbar, no sidebar.
  // The global layout still wraps it, but since we are not using StudentShell here,
  // it will just be a blank slate.
  return (
    <div className="min-h-screen bg-exam-bg text-exam-text selection:bg-exam-accent-light">
      {children}
    </div>
  );
}
