// Simulated students, used for (a) seeding the demo class and (b) the
// validation script. Each virtual student has a hidden "true" knowledge
// state with a planted root gap: the gap concept and everything that builds
// on it are not known. The engine never sees this hidden state; it only sees
// the answers, exactly like with a real student.

import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { MISCONCEPTIONS } from '../data/misconceptions.js';

export function rng(seed) {
  // mulberry32: small, fast, deterministic
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function descendants(conceptId) {
  const out = new Set([conceptId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of CONCEPTS) {
      if (!out.has(c.id) && c.prereqs.some((p) => out.has(p))) { out.add(c.id); grew = true; }
    }
  }
  return out;
}

/** Hidden knowledge: known concepts, given planted root gaps. */
export function plantGaps(roots) {
  const unknown = new Set();
  for (const r of roots) for (const d of descendants(r)) unknown.add(d);
  return new Set(CONCEPTS.map((c) => c.id).filter((id) => !unknown.has(id)));
}

export function makeSimStudent(roots, rand, { slip = 0.08, consistency = 0.8, learnRate = 0.25 } = {}) {
  const known = plantGaps(roots);
  return {
    roots, known, rand, slip, consistency, learnRate,
    /** Choose an option for a question, the way a student with this knowledge would. */
    answer(question) {
      const needs = new Set([question.concept]);
      for (const o of question.options) if (o.misconception) needs.add(MISCONCEPTIONS[o.misconception].concept);
      const knowsAll = [...needs].every((c) => known.has(c));
      const correctOpt = question.options.find((o) => o.correct);
      const wrong = question.options.filter((o) => !o.correct);
      if (knowsAll && rand() > slip) return correctOpt;
      if (!knowsAll && rand() < 1 / question.options.length) return correctOpt; // lucky guess
      // Pick the wrong option that matches a misconception this student holds.
      const held = wrong.filter((o) => o.misconception && !known.has(MISCONCEPTIONS[o.misconception].concept));
      if (held.length && rand() < consistency) return held[Math.floor(rand() * held.length)];
      return wrong[Math.floor(rand() * wrong.length)];
    },
    /** Being taught a concept: learn it if its prerequisites are known. */
    learn(conceptId, strength = 1) {
      const ready = CONCEPT_BY_ID[conceptId].prereqs.every((p) => known.has(p));
      if (ready && rand() < learnRate * strength) known.add(conceptId);
    },
  };
}

export const ROOT_CHOICES = ['c6_int', 'c6_frac', 'c6_var', 'c7_intops', 'c7_intmul', 'c7_fracops', 'c7_expr'];
