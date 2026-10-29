// Root-Cause Trace: follow the thread down the concept graph.
//
// When a student picks a wrong option, its misconception tag says which
// earlier concept to check. We ask ONE short probe question on that concept.
//   • Probe answered right → the thread is intact there.
//   • Probe answered wrong → move down to that concept and repeat, guided by
//     the misconception of the new wrong answer.
// At most 3 probes, so it never feels like another test. Concepts the student
// has already mastered are not probed at all.
//
// If a probe passes but the current concept has other prerequisites that are
// not yet mastered, the next probe checks the weakest of those instead.
//
// The trace is a small state machine so the same code runs in the UI (one
// probe per screen) and in the validation script (instantly).

import { CONCEPT_BY_ID, ancestors, pathUp } from '../data/concepts.js';
import { MISCONCEPTIONS } from '../data/misconceptions.js';
import { questionsFor } from '../data/questions.js';
import { MASTERED } from './bkt.js';
import { pKnown } from './student.js';

export const MAX_PROBES = 3;

export function startTrace(student, question, option) {
  const trace = {
    start: question.concept,
    startQuestion: question.id,
    current: question.concept,
    candidate: null,
    probes: [],              // { concept, q, o, correct, misconception }
    done: false,
    root: null,
    climb: [],
    reason: null,
  };
  trace.candidate = nextCandidate(student, trace, question.concept, option?.misconception);
  return trace;
}

/** Which concept to probe next, from a misconception tag or the weakest prerequisite. */
function nextCandidate(student, trace, current, misconceptionId) {
  const below = ancestors(trace.start);
  const m = misconceptionId ? MISCONCEPTIONS[misconceptionId] : null;
  if (m) {
    // The tag names the concept where the misconception lives. If that is not
    // where we are now, go there; otherwise follow its probe pointer down.
    const target = m.concept !== current ? m.concept : m.probe;
    if (target && below.has(target) && !probed(trace, target) && pKnown(student, target) < MASTERED) return target;
  }
  return weakestPrereq(student, current, trace);
}

function weakestPrereq(student, conceptId, trace) {
  const options = CONCEPT_BY_ID[conceptId].prereqs
    .filter((p) => !probed(trace, p))
    .map((p) => ({ p, k: pKnown(student, p) }))
    .filter((x) => x.k < MASTERED)
    .sort((a, b) => a.k - b.k || CONCEPT_BY_ID[a.p].grade - CONCEPT_BY_ID[b.p].grade);
  return options[0]?.p ?? null;
}

const probed = (trace, c) => trace.probes.some((p) => p.concept === c);

/** The next probe question, or null if the trace is finished. */
export function nextProbe(student, trace) {
  if (trace.done) return null;
  if (trace.probes.length >= MAX_PROBES) return finish(trace, 'max_probes');
  if (!trace.candidate) return finish(trace, 'no_lower_concept');

  const pool = questionsFor(trace.candidate);
  const used = new Set(student.attempts.slice(-30).map((a) => a.q));
  const q = pool.find((x) => x.probe && !used.has(x.id))
    || pool.filter((x) => !used.has(x.id)).sort((a, b) => a.level - b.level)[0]
    || pool.find((x) => x.probe);
  return q;
}

/** Record the student's answer to a probe and move the trace along. */
export function recordProbe(student, trace, question, option) {
  const correct = !!option.correct;
  trace.probes.push({ concept: question.concept, q: question.id, o: option.id, correct, misconception: option.misconception });
  if (correct) {
    // That link is intact. Before blaming the current concept, check its
    // other not-yet-mastered prerequisites while probes remain.
    trace.candidate = weakestPrereq(student, trace.current, trace);
    if (!trace.candidate) return finish(trace, 'prereqs_intact');
    return null;
  }
  trace.current = question.concept;
  trace.candidate = nextCandidate(student, trace, question.concept, option.misconception);
  return null;
}

function finish(trace, reason) {
  trace.done = true;
  trace.reason = reason;
  trace.root = trace.current;
  // Climb back up through the concepts that failed on the way down
  // (excluding the root itself), then retry the original question.
  const failed = trace.probes.filter((p) => !p.correct).map((p) => p.concept);
  trace.climb = failed.slice(0, -1).reverse();
  trace.fullPath = pathUp(trace.root, trace.start) || [trace.root];
  return null;
}

/** Run a whole trace in one go, with `answer(question)` returning the chosen option. */
export function runTrace(student, question, option, answer) {
  const trace = startTrace(student, question, option);
  let q = nextProbe(student, trace);
  while (q) {
    recordProbe(student, trace, q, answer(q));
    q = nextProbe(student, trace);
  }
  return trace;
}
