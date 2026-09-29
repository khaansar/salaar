/** 45 -> "45 min", 60 -> "1 hr", 90 -> "1 hr 30 min", 180 -> "3 hrs". */
export function formatDuration(minutes) {
  const total = Number(minutes);

  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }

  const hours = Math.floor(total / 60);
  const mins = Math.round(total % 60);

  if (hours === 0) return `${mins} min`;

  const hourLabel = `${hours} hr${hours === 1 ? '' : 's'}`;

  return mins === 0 ? hourLabel : `${hourLabel} ${mins} min`;
}
