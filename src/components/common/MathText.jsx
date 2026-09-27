import React, { useMemo } from 'react';
import katex from 'katex';

function renderLatex(expr, displayMode) {
  try {
    return katex.renderToString(expr, {
      throwOnError: false,
      displayMode,
      strict: false,
    });
  } catch {
    return expr;
  }
}

function segmentsFor(raw) {
  if (!raw) return [];
  const pattern = /(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$|(?<!\\)\$([^\n]*?)(?<!\\)\$|!\[([^\]]*)\]\(([^)\s]+)\)/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: raw.slice(lastIndex, match.index).replace(/\\\$/g, '$') });
    }
    if (match[1] !== undefined) {
      segments.push({ type: 'block', value: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: 'inline', value: match[2] });
    } else {
      segments.push({ type: 'image', alt: match[3], url: match[4] });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < raw.length) {
    segments.push({ type: 'text', value: raw.slice(lastIndex).replace(/\\\$/g, '$') });
  }
  return segments;
}

export function MathText({ text, className = '' }) {
  const segments = useMemo(() => segmentsFor(text || ''), [text]);

  if (!text) return null;

  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.type === 'block') {
          return (
            <div
              key={i}
              className="my-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: renderLatex(seg.value, true) }}
            />
          );
        }
        if (seg.type === 'inline') {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: renderLatex(seg.value, false) }}
            />
          );
        }
        if (seg.type === 'image') {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={seg.url}
              alt={seg.alt || ''}
              className="my-2 max-w-full rounded-md border border-slate-200"
            />
          );
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {seg.value}
          </span>
        );
      })}
    </div>
  );
}