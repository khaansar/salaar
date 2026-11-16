/* Formatting helpers shared by the attempt review page and its print sheet. */

export const REVIEW_STATUSES = ['CORRECT', 'WRONG', 'UNANSWERED'];

export const statusOf = (q) => {
  const key = String(q?.status || 'UNANSWERED').toUpperCase();
  return REVIEW_STATUSES.includes(key) ? key : 'UNANSWERED';
};

export function asNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function formatNumber(value) {
  const number = asNumber(value);
  if (number === null) return '—';
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function parseAnswerKeys(value) {
  if (value === null || value === undefined || value === '') return [];
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  const raw = String(value).trim();
  if (!raw) return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).map((v) => v.trim()).filter(Boolean);
    } catch {
      return raw.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    }
  }
  return raw.includes(',') ? raw.split(',').map((v) => v.trim()).filter(Boolean) : [raw];
}

/* Backend options are { optionId: optionText }. Keep the real ID for matching, show A/B/C/D. */
export function normalizeOptions(options) {
  let entries = [];
  if (Array.isArray(options)) {
    entries = options.map((option, index) => {
      if (option && typeof option === 'object') {
        const id = option.optionId ?? option.id ?? option.key ?? option.optionKey ?? String(index);
        const text = option.text ?? option.label ?? option.value ?? option.content ?? '';
        return [String(id), typeof text === 'string' ? text : JSON.stringify(text)];
      }
      return [String(index), String(option ?? '')];
    });
  } else if (options && typeof options === 'object') {
    entries = Object.entries(options).map(([id, text]) => [
      id,
      typeof text === 'string' ? text : text == null ? '' : String(text.text ?? text.label ?? text.value ?? JSON.stringify(text)),
    ]);
  } else if (typeof options === 'string') {
    try { return normalizeOptions(JSON.parse(options)); } catch { return []; }
  }
  return entries.map(([id, text], index) => ({ id, label: String.fromCharCode(65 + (index % 26)), text }));
}

/* Same order and fields as the exam screen: sorted by sequence, with captions. */
export function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((image, index) => {
    if (typeof image === 'string') return { url: image, altText: '', caption: '', sequence: index };
    if (!image || typeof image !== 'object') return null;
    return {
      url: image.url ?? image.imageUrl ?? image.src ?? '',
      altText: image.altText ?? image.alt_text ?? '',
      caption: image.caption ?? '',
      sequence: Number.isInteger(image.sequence) ? image.sequence : index,
    };
  })
    .filter((image) => typeof image?.url === 'string' && image.url.trim())
    .sort((a, b) => a.sequence - b.sequence);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
