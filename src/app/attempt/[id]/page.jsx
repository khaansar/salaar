import ForceLightTheme from '@/components/theme/ForceLightTheme';
import ExamShell from '../../../features/attempt/components/ExamShell';
import { siteConfig } from '../../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('Taking Test'),
};

export default async function AttemptPage({ params }) {
  // Await params in Next 15+
  const { id } = await params;
  
  return (
    <>
        <ForceLightTheme />
        <ExamShell attemptId={id} />
    </>
  );
}
