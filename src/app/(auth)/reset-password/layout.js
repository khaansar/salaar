import PublicFooter from '../../../components/student/PublicFooter';

export default function ResetPasswordLayout({ children }) {
  return (
    <>
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </>
  );
}
