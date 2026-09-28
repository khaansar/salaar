import { PageHeader } from '@/components/common/PageHeader';
import { CategoryForm } from '@/features/categories/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Exam Categories', href: '/admin-dashboard/categories' },
          { label: 'Create Category' },
        ]}
        title="Create Exam Category"
        subtitle="Add a new exam category to organize your tests and make them easy to find."
      />
      <CategoryForm />
    </div>
  );
}