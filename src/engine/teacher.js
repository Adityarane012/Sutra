// Teacher analytics: root gaps per student, the morning brief, buddy pairs
// and alerts. Sutra only does the sorting — the teacher approves or overrides.

import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { MASTERED, WEAK } from './bkt.js';
import { pKnown } from './student.js';

/**
 * A student's root gap: the lowest-grade weak concept whose own
 * prerequisites are NOT weak. Fixing it unblocks everything above it.
 */
export function rootGap(student) {
  const weak = CONCEPTS.filter((c) => pKnown(student, c.id) < WEAK);
  const roots = weak.filter((c) => c.prereqs.every((p) => pKnown(student, p) >= WEAK));
  roots.sort((a, b) => a.grade - b.grade || pKnown(student, a.id) - pKnown(student, b.id));
  return roots[0]?.id ?? null;
}

export function rootGapCounts(students) {
  const counts = {};
  for (const s of students) {
    const r = rootGap(s);
    if (r) counts[r] = (counts[r] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

/**
 * Greedy buddy pairing: strongest helpers with the most stuck learners on the
 * same concept. Each helper is used once.
 */
export function buddyPairs(students, conceptId, max = 12) {
  const helpers = students.filter((s) => pKnown(s, conceptId) >= MASTERED).sort((a, b) => pKnown(b, conceptId) - pKnown(a, conceptId));
  const learners = students.filter((s) => pKnown(s, conceptId) < WEAK).sort((a, b) => pKnown(a, conceptId) - pKnown(b, conceptId));
  const pairs = [];
  for (let i = 0; i < Math.min(helpers.length, learners.length, max); i++) {
    pairs.push({ helper: helpers[i], learner: learners[i] });
  }
  return pairs;
}

const DAY = 24 * 60 * 60 * 1000;

export function alerts(students, now = Date.now()) {
  const out = [];
  for (const s of students) {
    const weakCount = CONCEPTS.filter((c) => pKnown(s, c.id) < WEAK).length;
    const idleDays = Math.floor((now - s.lastActive) / DAY);
    if (idleDays >= 5) out.push({ student: s, kind: 'idle', days: idleDays });
    else if (weakCount >= 5) out.push({ student: s, kind: 'many_gaps', count: weakCount });
  }
  return out;
}

export function morningBrief(students, focusOverride = null) {
  const counts = rootGapCounts(students);
  const top = focusOverride || counts[0]?.[0] || null;
  const stuck = top ? students.filter((s) => rootGap(s) === top) : [];
  return {
    top,
    topCount: top ? (counts.find(([c]) => c === top)?.[1] ?? stuck.length) : 0,
    total: students.length,
    counts,
    pairs: top ? buddyPairs(students, top) : [],
    alerts: alerts(students),
    grade: top ? CONCEPT_BY_ID[top].grade : null,
  };
}
