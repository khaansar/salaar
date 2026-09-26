import { PageHeader } from '@/components/common/PageHeader';
import { QuestionForm } from '@/features/questions/QuestionForm';

export default function NewQuestionPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Question Bank', href: '/admin-dashboard/questions' },
          { label: 'New question' },
        ]}
        title="New question"
        subtitle="Author a question and add it to your reusable question bank."
      />
      <QuestionForm />
    </div>
  );
}
