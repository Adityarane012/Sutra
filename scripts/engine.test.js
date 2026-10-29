// Quick checks of the engine.   npm test
import assert from 'node:assert/strict';
import { CONCEPTS } from '../src/data/concepts.js';
import { QUESTIONS, QUESTION_BY_ID } from '../src/data/questions.js';
import { MISCONCEPTIONS } from '../src/data/misconceptions.js';
import { LESSONS } from '../src/data/lessons.js';
import { updateMastery } from '../src/engine/bkt.js';
import { updateElo, priorRating, confidence } from '../src/engine/elo.js';
import { createStudent } from '../src/engine/student.js';
import { startTrace, nextProbe, recordProbe } from '../src/engine/trace.js';
import { buddyPairs } from '../src/engine/teacher.js';
import { seedDemo } from '../src/engine/seed.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓', name); };

test('content is consistent', () => {
  const ids = new Set(CONCEPTS.map((c) => c.id));
  for (const c of CONCEPTS) for (const p of c.prereqs) assert.ok(ids.has(p), `${c.id} → ${p}`);
  for (const q of QUESTIONS) {
    assert.ok(ids.has(q.concept), q.id);
    assert.equal(q.options.filter((o) => o.correct).length, 1, `${q.id} needs exactly one correct option`);
    for (const o of q.options) if (o.misconception) assert.ok(MISCONCEPTIONS[o.misconception], `${q.id}: ${o.misconception}`);
    assert.ok(q.text.en && q.text.hi && q.hint.hi && q.step.hi, `${q.id} needs EN + HI text`);
  }
  for (const c of CONCEPTS) {
    assert.ok(LESSONS[c.id], `lesson for ${c.id}`);
    assert.equal(QUESTIONS.filter((q) => q.concept === c.id && q.probe).length, 1, `one probe for ${c.id}`);
  }
});

test('BKT: right answers raise mastery, wrong ones lower it', () => {
  assert.ok(updateMastery(0.5, true) > 0.5);
  assert.ok(updateMastery(0.5, false) < 0.5);
  assert.ok(updateMastery(0.5, true, { hintsUsed: 2 }) < updateMastery(0.5, true), 'hints weaken evidence');
});

test('Elo: cold start prior and decaying trust', () => {
  const q = QUESTION_BY_ID.c9_lin2_1;
  assert.ok(priorRating(q, 9) > priorRating(QUESTION_BY_ID.c6_int_1, 6));
  const r = updateElo(1000, { rating: 1000, n: 0 }, false);
  assert.ok(r.question.rating > 1000 && r.student < 1000);
  assert.ok(confidence(0) === 0 && confidence(20) === 0.5);
});

test('Root-Cause Trace: demo story goes Class 9 → 7 → 6', () => {
  const st = seedDemo();
  const riya = st.students.riya;
  const q = QUESTION_BY_ID.c9_lin2_1;
  const wrong = q.options.find((o) => o.misconception === 'm_sub_neg');
  const tr = startTrace(riya, q, wrong);
  const p1 = nextProbe(riya, tr);
  assert.equal(p1.concept, 'c7_intops');
  recordProbe(riya, tr, p1, p1.options.find((o) => o.misconception === 'm_sub_neg'));
  const p2 = nextProbe(riya, tr);
  assert.equal(p2.concept, 'c6_int');
  recordProbe(riya, tr, p2, p2.options.find((o) => o.misconception === 'm_order_neg'));
  assert.equal(nextProbe(riya, tr), null);
  assert.equal(tr.root, 'c6_int');
  assert.deepEqual(tr.climb, ['c7_intops']);
});

test('Trace never asks more than 3 probes', () => {
  const s = createStudent({ id: 'x', name: 'x', grade: 9 });
  const q = QUESTION_BY_ID.c9_poly_5;
  const tr = startTrace(s, q, q.options[1]);
  let p, n = 0;
  while ((p = nextProbe(s, tr))) { recordProbe(s, tr, p, p.options.find((o) => !o.correct)); n++; }
  assert.ok(n <= 3);
});

test('Buddy pairs match helpers with stuck students', () => {
  const a = createStudent({ id: 'a', name: 'A', grade: 9, mastery: { c6_int: 0.95 } });
  const b = createStudent({ id: 'b', name: 'B', grade: 9, mastery: { c6_int: 0.1 } });
  const pairs = buddyPairs([a, b], 'c6_int');
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].helper.id, 'a');
});

console.log(`\n${passed} checks passed`);
