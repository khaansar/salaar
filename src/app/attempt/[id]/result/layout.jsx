import DashboardLayout from '../../../(dashboard)/layout';

export default function ResultLayout({
  children,
}) {
  return (
    <div className="print-dashboard-shell">
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </div>
  );
}