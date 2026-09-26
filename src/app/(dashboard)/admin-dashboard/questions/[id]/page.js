'use client';

import React, { use, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { QuestionForm } from '@/features/questions/QuestionForm';
import { questionsApi } from '@/services/adminService';

export default function EditQuestionPage({ params }) {
  // Next.js 16: route params are async, unwrap with React's use()
  const { id } = use(params);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    questionsApi
      .get(id)
      .then(setQuestion)
      .catch((err) => setError(err?.message || 'Failed to load question'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Question Bank', href: '/admin-dashboard/questions' },
          { label: 'Edit question' },
        ]}
        title="Edit question"
        subtitle={question?.translations?.[0]?.questionText?.slice(0, 90)}
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && question && <QuestionForm question={question} />}
    </div>
  );
}
