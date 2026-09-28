import ExamShell from '../../../features/attempt/components/ExamShell';

export const metadata = {
  title: 'Taking Test - PrepHub',
};

export default async function AttemptPage({ params }) {
  // Await params in Next 15+
  const { id } = await params;
  
  return (
    <ExamShell attemptId={id} />
  );
}
