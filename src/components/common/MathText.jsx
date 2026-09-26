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

/**
 * Splits `raw` into text / inline-math ($...$) / block-math ($$...$$) segments
 * and renders each appropriately. Falls back gracefully to plain text if the
 * content has no LaTeX in it.
 */
function segmentsFor(raw) {
  if (!raw) return [];
  const pattern = /\$\$([^$]+)\$\$|\$([^$\n]+)\$/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ type: 'block', value: match[1] });
    } else {
      segments.push({ type: 'inline', value: match[2] });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < raw.length) {
    segments.push({ type: 'text', value: raw.slice(lastIndex) });
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
        return (
          <span key={i} className="whitespace-pre-wrap">
            {seg.value}
          </span>
        );
      })}
    </div>
  );
}
