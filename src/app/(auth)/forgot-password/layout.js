import PublicFooter from '../../../components/student/PublicFooter';

export default function ForgotPasswordLayout({ children }) {
  return (
    <>
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </>
  );
}
