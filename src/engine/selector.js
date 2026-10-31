// What to learn next, and which question to ask.
//
// Next concept: a teacher override wins. Otherwise the lowest-mastery concept
// whose prerequisites are all mastered (so we never build on a broken link).
//
// Next question: aim for about a 70% chance of success ("challenging but not
// frustrating"). After a streak of 3 correct we aim harder (55%); after 2
// misses we aim easier (85%).
//
// P(success) blends two models, weighted by how much we trust the question's
// Elo rating (Elo cold start, see elo.js):
//    P = w · Elo(student, question) + (1 − w) · BKT(student, concept)
// With few attempts on a question, w ≈ 0 and BKT decides.

import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { questionsFor } from '../data/questions.js';
import { MASTERED, predictCorrect } from './bkt.js';
import { expected, confidence } from './elo.js';
import { isDue } from './review.js';
import { pKnown, qStat } from './student.js';

export const TARGET = { normal: 0.7, harder: 0.55, easier: 0.85 };

export function nextConcept(student, classFocus = null) {
  if (student.focus) return student.focus;
  if (classFocus && pKnown(student, classFocus) < MASTERED) return classFocus;
  const ready = CONCEPTS.filter(
    (c) => pKnown(student, c.id) < MASTERED && c.prereqs.every((p) => pKnown(student, p) >= MASTERED)
  );
  if (!ready.length) {
    // Everything mastered: stretch on the highest-grade concept.
    return CONCEPTS[CONCEPTS.length - 1].id;
  }
  ready.sort((a, b) => pKnown(student, a.id) - pKnown(student, b.id) || a.grade - b.grade);
  return ready[0].id;
}

export function successChance(student, qstats, question) {
  const stat = qStat(qstats, question);
  const w = confidence(stat.n);
  const elo = expected(student.rating, stat.rating);
  const bkt = predictCorrect(pKnown(student, question.concept));
  // Spread BKT a little by question level so it can still tell easy from hard.
  const bktLevel = clamp(bkt + (2 - question.level) * 0.05, 0.05, 0.95);
  return w * elo + (1 - w) * bktLevel;
}

export function currentTarget(student) {
  const recent = student.attempts.filter((a) => a.mode === 'practice').slice(-3);
  if (recent.length === 3 && recent.every((a) => a.correct)) return { key: 'harder', p: TARGET.harder };
  const last2 = recent.slice(-2);
  if (last2.length === 2 && last2.every((a) => !a.correct)) return { key: 'easier', p: TARGET.easier };
  return { key: 'normal', p: TARGET.normal };
}

export function pickQuestion(student, qstats, conceptId, { exclude = [], target } = {}) {
  const t = target ?? currentTarget(student).p;
  const recent = new Set([...exclude, ...student.attempts.slice(-6).map((a) => a.q)]);
  let pool = questionsFor(conceptId).filter((q) => !recent.has(q.id));
  if (!pool.length) pool = questionsFor(conceptId).filter((q) => !exclude.includes(q.id));
  if (!pool.length) pool = questionsFor(conceptId);
  return pool
    .map((q) => ({ q, d: Math.abs(successChance(student, qstats, q) - t) }))
    .sort((a, b) => a.d - b.d)[0].q;
}

/** An easier "twin" for the last rung of the hint ladder. */
export function easierTwin(student, qstats, question) {
  const pool = questionsFor(question.concept).filter((q) => q.id !== question.id);
  return pool
    .map((q) => ({ q, s: successChance(student, qstats, q) }))
    .sort((a, b) => b.s - a.s)[0]?.q ?? null;
}

/** Warm-up: 1 question on today's concept + up to 2 due reviews. */
export function warmUp(student, qstats, classFocus = null, now = Date.now()) {
  const today = nextConcept(student, classFocus);
  const due = CONCEPTS
    .filter((c) => c.id !== today && pKnown(student, c.id) >= 0.6 && isDue(student.mastery[c.id], now))
    .sort((a, b) => student.mastery[a.id].due - student.mastery[b.id].due)
    .slice(0, 2)
    .map((c) => c.id);
  const concepts = [today, ...due];
  const picked = [];
  for (const c of concepts) picked.push(pickQuestion(student, qstats, c, { exclude: picked.map((q) => q.id), target: TARGET.normal }));
  return { today, review: due, questions: picked };
}

export const conceptName = (id, lang) => CONCEPT_BY_ID[id].name[lang] || CONCEPT_BY_ID[id].name.en;

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
