export type PickupSlot = { value: string; label: string };

function parseClockPart(value: string) {
  const match = value.trim().match(/^(\d{1,2})h(?:(\d{2}))?$/i);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatSlot(totalMinutes: number): PickupSlot {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return { value: `${hours}:${minutes}`, label: `${Number(hours)}h${minutes}` };
}

/**
 * Builds three simple collection choices: start, middle and a final option
 * ten minutes before the end of the collection window.
 */
export function buildPickupSlots(window: string): PickupSlot[] {
  const [startText, endText] = window.split(/[–—-]/).map((part) => part.trim());
  const start = startText ? parseClockPart(startText) : null;
  const end = endText ? parseClockPart(endText) : null;
  if (start === null || end === null || end <= start) return [];

  const middle = start + Math.floor((end - start) / 2 / 10) * 10;
  const final = Math.max(start, end - 10);
  return [start, middle, final]
    .filter((value, index, values) => values.indexOf(value) === index)
    .map(formatSlot);
}
