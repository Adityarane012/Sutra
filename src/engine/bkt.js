// Bayesian Knowledge Tracing (Corbett & Anderson, 1995).
// For every student × concept we keep P(known): the probability the student
// has mastered it. After each answer we update it with Bayes' rule, allowing
// for lucky guesses and careless slips, then add a chance of learning.

export const BKT = {
  pInit: 0.3,      // prior before any evidence
  pTransit: 0.15,  // chance of learning the concept from one practice step
  pGuess: 0.2,     // chance of answering right without knowing it
  pSlip: 0.1,      // chance of answering wrong despite knowing it
};

export const MASTERED = 0.85;
export const WEAK = 0.4;

/** Probability the next answer on this concept will be correct. */
export function predictCorrect(pKnown, params = BKT) {
  return pKnown * (1 - params.pSlip) + (1 - pKnown) * params.pGuess;
}

/**
 * Update P(known) after one answer.
 * A correct answer that needed hints is weaker evidence, so we raise the
 * guess rate for it.
 */
export function updateMastery(pKnown, correct, { hintsUsed = 0, params = BKT } = {}) {
  const guess = hintsUsed > 0 ? Math.min(0.6, params.pGuess + 0.2 * hintsUsed) : params.pGuess;
  const slip = params.pSlip;
  let posterior;
  if (correct) {
    const num = pKnown * (1 - slip);
    posterior = num / (num + (1 - pKnown) * guess);
  } else {
    const num = pKnown * slip;
    posterior = num / (num + (1 - pKnown) * (1 - guess));
  }
  const next = posterior + (1 - posterior) * params.pTransit;
  return clamp(next, 0.01, 0.99);
}

/** After a micro-lesson the student has been taught directly: a bigger learning step. */
export function afterLesson(pKnown) {
  return clamp(pKnown + (1 - pKnown) * 0.35, 0.01, 0.99);
}

export function band(p) {
  if (p >= MASTERED) return 'mastered';
  if (p >= 0.6) return 'ok';
  if (p >= WEAK) return 'shaky';
  return 'weak';
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
