import ForceLightTheme from '@/components/theme/ForceLightTheme';
import AttemptReviewPage from '@/features/attemptReview/components/AttemptReviewPage';
import { siteConfig } from '@/config/site';

export async function generateMetadata() {
  return {
    title: siteConfig.formatTitle('Attempt Review'),
  };
}

export default async function AttemptReviewRoute({ params }) {
  // Next.js 15+ supplies params as a Promise.
  const { id } = await params;

  return (
    <>
      <ForceLightTheme />
      <AttemptReviewPage attemptId={id} />
    </>
  );
}
