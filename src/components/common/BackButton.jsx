'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavigationHistory } from './NavigationHistory';

export default function BackButton({
  fallbackHref = '/',
  className = '',
  iconSize = 16,
  ...buttonProps
}) {
  const router = useRouter();
  const { previousRoute } = useNavigationHistory();

  const handleClick = () => {
    if (previousRoute) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button type="button" onClick={handleClick} className={className} {...buttonProps}>
      <ArrowLeft size={iconSize} aria-hidden />
      <span>Back</span>
    </button>
  );
}
