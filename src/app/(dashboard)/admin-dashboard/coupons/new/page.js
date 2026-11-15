'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { CouponForm } from '@/features/coupons/CouponForm';

export default function NewCouponPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Coupons', href: '/admin-dashboard/coupons' },
          { label: 'New coupon' },
        ]}
        title="New Coupon"
        subtitle="Create a discount code customers can enter at checkout."
      />
      <CouponForm />
    </div>
  );
}
