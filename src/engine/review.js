// Spaced review with Leitner boxes.
// Each concept sits in a box 1–5. A correct review moves it up a box (seen
// less often); a miss sends it back to box 1 (seen again tomorrow).

export const BOX_DAYS = [0, 1, 3, 7, 14, 30]; // index = box
const DAY = 24 * 60 * 60 * 1000;

export function scheduleReview(entry, correct, now = Date.now()) {
  const box = correct ? Math.min(5, (entry.box || 1) + 1) : 1;
  return { ...entry, box, due: now + BOX_DAYS[box] * DAY };
}

export function isDue(entry, now = Date.now()) {
  return entry && entry.due !== undefined && entry.due <= now;
}
