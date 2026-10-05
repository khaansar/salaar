'use client';

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '../../config/site';

export function BrandIcon({ size = 'md', className = '' }) {
  const pixelMap = {
    xs: 24,
    sm: 30,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const px = pixelMap[size] || pixelMap.md;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: px, height: px }}
    >
      <Image
        src="/brand/icon.png"
        alt={siteConfig.name}
        width={px}
        height={px}
        priority
        className="h-full w-full object-contain drop-shadow-xs"
      />
    </div>
  );
}

export function BrandText({
  name = siteConfig.name,
  size = 'md',
  badge = null,
  showTagline = false,
  tagline = siteConfig.tagline,
  className = '',
}) {
  const textSizeMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const textSize = textSizeMap[size] || textSizeMap.md;

  // Normalize name parsing (e.g. "Ace-it", "Ace it", "AceIt")
  const cleanName = (name || 'Ace-it').trim();
  let firstPart = 'Ace';
  let restPart = 'it';
  let separator = '-';

  if (cleanName.includes('-')) {
    const parts = cleanName.split('-');
    firstPart = parts[0];
    restPart = parts.slice(1).join('-');
    separator = '-';
  } else if (cleanName.includes(' ')) {
    const parts = cleanName.split(/\s+/);
    firstPart = parts[0];
    restPart = parts.slice(1).join(' ');
    separator = ' ';
  } else {
    firstPart = cleanName;
    restPart = '';
    separator = '';
  }

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <div className={`flex items-center font-black tracking-tight ${textSize}`}>
        <span className="text-slate-900 dark:text-white transition-colors">
          {firstPart}
        </span>

        {restPart ? (
          <>
            {separator === '-' ? (
              <span className="text-sky-500 font-bold mx-0.5">-</span>
            ) : (
              <span className="mx-0.5">&nbsp;</span>
            )}
            <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">
              {restPart}
            </span>
          </>
        ) : null}

        {badge ? (
          <span className="ml-2 inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
            {badge}
          </span>
        ) : null}
      </div>

      {showTagline && tagline ? (
        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
          <span className="h-px w-2 bg-slate-300 dark:bg-slate-700" />
          <span>{tagline}</span>
          <span className="h-px w-2 bg-slate-300 dark:bg-slate-700" />
        </div>
      ) : null}
    </div>
  );
}

export default function BrandLogo({
  href = '/',
  size = 'md',
  showIcon = true,
  showText = true,
  showTagline = false,
  badge = null,
  collapsed = false,
  layout = 'horizontal', // 'horizontal' | 'stacked'
  className = '',
  onClick,
}) {
  const isStacked = layout === 'stacked';

  const content = (
    <div
      className={`group select-none transition-opacity hover:opacity-95 ${
        isStacked
          ? 'flex flex-col items-center text-center gap-2'
          : 'inline-flex items-center gap-2.5'
      } ${className}`}
    >
      {showIcon && <BrandIcon size={size} />}
      {showText && !collapsed && (
        <BrandText
          size={size}
          badge={badge}
          showTagline={showTagline}
          className={isStacked ? 'items-center' : ''}
        />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
