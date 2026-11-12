'use client';

import { use } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { CouponForm } from '@/features/coupons/CouponForm';
import { useGetAdminCouponQuery } from '@/store/adminApi';
import { errorMessage } from '@/components/admin/paymentFormat';

export default function EditCouponPage({ params }) {
  const { id } = use(params);
  // refetchOnMountOrArgChange: the form is seeded once, so start from the latest server copy.
  const { currentData: coupon, isLoading, isError, error, refetch } = useGetAdminCouponQuery(id, { refetchOnMountOrArgChange: true });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Coupons', href: '/admin-dashboard/coupons' },
          { label: coupon?.code || '…' },
          { label: 'Edit' },
        ]}
        title="Edit Coupon"
        subtitle={coupon?.code}
      />
      {isLoading && <TableSkeleton rows={4} cols={1} />}
      {isError && <ErrorState message={errorMessage(error, 'Failed to load coupon')} onRetry={refetch} />}
      {coupon && <CouponForm key={coupon.id} coupon={coupon} />}
    </div>
  );
}
