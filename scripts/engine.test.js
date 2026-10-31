// Comprehensive engine test suite and edge-case verification.   npm test
import assert from 'node:assert/strict';
import { CONCEPTS, CONCEPT_BY_ID, ancestors, pathUp, dependents } from '../src/data/concepts.js';
import { QUESTIONS, QUESTION_BY_ID, questionsFor } from '../src/data/questions.js';
import { MISCONCEPTIONS } from '../src/data/misconceptions.js';
import { LESSONS } from '../src/data/lessons.js';
import { BKT, updateMastery, afterLesson, MASTERED, WEAK, predictCorrect, band } from '../src/engine/bkt.js';
import { ELO, updateElo, priorRating, studentStartRating, expected, confidence, kQuestion } from '../src/engine/elo.js';
import { createStudent, pKnown, qStat, recordAnswer, recordLesson } from '../src/engine/student.js';
import { startTrace, nextProbe, recordProbe, runTrace, MAX_PROBES } from '../src/engine/trace.js';
import { rootGap, rootGapCounts, buddyPairs, alerts, morningBrief } from '../src/engine/teacher.js';
import { scheduleReview, isDue, BOX_DAYS } from '../src/engine/review.js';
import { nextConcept, successChance, currentTarget, pickQuestion, easierTwin, warmUp, TARGET } from '../src/engine/selector.js';
import { seedDemo } from '../src/engine/seed.js';
import { shuffleOptions } from '../src/engine/randomize.js';
import { t, tx } from '../src/i18n.js';
import { scriptedTurn, matchIdeas, normalise } from '../src/chotu/scripted.js';
import { RUBRICS } from '../src/chotu/rubrics.js';

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

test('Option Randomization: preserves options, tags, and is deterministic per student', () => {
  const q = QUESTION_BY_ID.c9_lin2_1;
  const originalCorrect = q.options.find((o) => o.correct).id;
  const shuffledRiya = shuffleOptions(q.options, 'riya:c9_lin2_1');
  const shuffledKabir = shuffleOptions(q.options, 'kabir:c9_lin2_1');

  // Correct count and tags preserved
  assert.equal(shuffledRiya.length, q.options.length);
  assert.equal(shuffledRiya.find((o) => o.correct).id, originalCorrect);
  assert.ok(shuffledRiya.some((o) => o.misconception === 'm_sub_neg'));

  // Deterministic across re-renders / language toggles
  const shuffledRiyaAgain = shuffleOptions(q.options, 'riya:c9_lin2_1');
  assert.deepEqual(shuffledRiya.map((o) => o.id), shuffledRiyaAgain.map((o) => o.id));

  // Shuffled differently across students
  assert.notDeepEqual(shuffledRiya.map((o) => o.id), shuffledKabir.map((o) => o.id));
});

test('i18n supports English, Hinglish, and Hindi seamlessly', () => {
  assert.equal(t('en', 'todayPlan'), 'Today’s 15 minutes');
  assert.equal(t('hi', 'todayPlan'), 'आज के 15 मिनट');
  assert.equal(t('hinglish', 'todayPlan'), 'Aaj ke 15 minutes');

  const obj = { en: 'Hello', hi: 'नमस्ते' };
  assert.equal(tx(obj, 'en'), 'Hello');
  assert.equal(tx(obj, 'hi'), 'नमस्ते');
  assert.equal(tx(obj, 'hinglish'), 'Hello');
});

test('Property: Concept Graph is a valid DAG with no cycles (Kahn topological sort)', () => {
  const inDegree = {};
  const adj = {};
  for (const c of CONCEPTS) {
    inDegree[c.id] = 0;
    adj[c.id] = [];
  }
  for (const c of CONCEPTS) {
    for (const p of c.prereqs) {
      assert.ok(inDegree[p] !== undefined, `Prerequisite ${p} must exist in concepts`);
      assert.notEqual(c.id, p, `Self prerequisite forbidden on ${c.id}`);
      adj[p].push(c.id);
      inDegree[c.id]++;
    }
  }
  const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
  let visited = 0;
  while (queue.length) {
    const node = queue.shift();
    visited++;
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }
  assert.equal(visited, CONCEPTS.length, 'Graph must have no cycles (topological sort visits all nodes)');
});

test('Property: BKT numerical stability & clamping boundaries under extreme stress', () => {
  let p = 0.5;
  // 100 consecutive misses should decay smoothly but never go below 0.01
  for (let i = 0; i < 100; i++) {
    const next = updateMastery(p, false);
    assert.ok(next <= p, `Monotonic decrease: ${next} <= ${p}`);
    assert.ok(next >= 0.01, `Never drops below lower clamp bound: ${next} >= 0.01`);
    p = next;
  }
  assert.ok(p <= 0.20 && p < WEAK, `Decayed into deep root-gap zone below P(T) transit baseline: ${p}`);

  // 100 consecutive correct should rise smoothly but never exceed 0.99
  for (let i = 0; i < 100; i++) {
    const next = updateMastery(p, true);
    assert.ok(next >= p, `Monotonic increase: ${next} >= ${p}`);
    assert.ok(next <= 0.99, `Never exceeds upper clamp bound: ${next} <= 0.99`);
    p = next;
  }
  assert.ok(p >= 0.98, 'Risen near maximum');

  // Direct lesson booster invariant
  for (const val of [0.01, 0.2, 0.5, 0.8, 0.95]) {
    assert.ok(afterLesson(val) > val, `Lesson always increases mastery: ${afterLesson(val)} > ${val}`);
  }
});

test('Property: Elo K-factor and confidence invariants', () => {
  assert.equal(confidence(0), 0);
  assert.equal(confidence(20), 0.5);
  assert.ok(confidence(100) > 0.8 && confidence(100) < 1);

  // Decaying K-factor monotonic decrease
  for (let n = 0; n < 100; n++) {
    assert.ok(kQuestion(n) >= kQuestion(n + 1), `K-factor non-increasing: ${kQuestion(n)} >= ${kQuestion(n + 1)}`);
    assert.ok(kQuestion(n) >= 12 && kQuestion(n) <= 64, 'K-factor within [12, 64]');
  }
});

test('Property: Trace Fuzzing across 100 random student profiles and question failures', () => {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let run = 0; run < 100; run++) {
    const mastery = {};
    for (const c of CONCEPTS) mastery[c.id] = rand();
    const student = createStudent({ id: `fuzz_${run}`, grade: 6 + Math.floor(rand() * 4), mastery });

    const q = QUESTIONS[Math.floor(rand() * QUESTIONS.length)];
    const wrongOptions = q.options.filter((o) => !o.correct);
    const chosenWrong = wrongOptions[Math.floor(rand() * wrongOptions.length)];

    const trace = runTrace(student, q, chosenWrong, (probeQ) => {
      const km = student.mastery[probeQ.concept]?.p ?? 0.5;
      const isRight = rand() < km;
      if (isRight) return probeQ.options.find((o) => o.correct);
      const wrongs = probeQ.options.filter((o) => !o.correct);
      return wrongs[Math.floor(rand() * wrongs.length)];
    });

    assert.ok(trace.probes.length <= 3, `Trace never exceeds 3 probes (got ${trace.probes.length})`);
    assert.ok(trace.done, 'Trace must terminate and mark done');
    assert.ok(trace.root, 'Trace must identify a root concept');

    const probedConcepts = trace.probes.map((p) => p.concept);
    const uniqueProbed = new Set(probedConcepts);
    assert.equal(probedConcepts.length, uniqueProbed.size, 'No concept probed twice in single trace');
  }
});

test('Property: Option Randomization is a strict permutation bijection', () => {
  for (const q of QUESTIONS) {
    const originalIds = q.options.map((o) => o.id).sort();
    for (const studentId of ['riya', 'kabir', 'student_123', 'guest']) {
      const shuffled = shuffleOptions(q.options, `${studentId}:${q.id}:0`);
      assert.equal(shuffled.length, q.options.length, 'Length preserved');
      const shuffledIds = shuffled.map((o) => o.id).sort();
      assert.deepEqual(shuffledIds, originalIds, 'Strict bijection of options');

      for (const orig of q.options) {
        const found = shuffled.find((o) => o.id === orig.id);
        assert.equal(found.correct, orig.correct);
        assert.equal(found.misconception, orig.misconception);
      }
    }
  }
});

// ==========================================
// EDGE CASE TESTS
// ==========================================

test('Edge Case: BKT extreme probabilities, hint saturation, and boundary bands', () => {
  // P=0 and P=1 handling
  const pFromZero = updateMastery(0, false);
  assert.ok(pFromZero >= 0.01 && pFromZero <= 0.99, 'Clamped at bounds from 0');
  const pFromOne = updateMastery(1, true);
  assert.equal(pFromOne, 0.99, 'Clamped at upper 0.99');

  // Hint ladder saturation (guess rate caps at 0.60)
  const masteryWith5Hints = updateMastery(0.5, true, { hintsUsed: 5 });
  const masteryWith50Hints = updateMastery(0.5, true, { hintsUsed: 50 });
  assert.equal(masteryWith5Hints, masteryWith50Hints, 'Guess rate strictly capped at 0.60');

  // Boundary prediction checks
  assert.ok(Math.abs(predictCorrect(0) - BKT.pGuess) < 1e-6, 'P=0 prediction equals pGuess');
  assert.ok(Math.abs(predictCorrect(1) - (1 - BKT.pSlip)) < 1e-6, 'P=1 prediction equals 1 - pSlip');

  // Exact mastery band thresholds
  assert.equal(band(1.0), 'mastered');
  assert.equal(band(0.85), 'mastered');
  assert.equal(band(0.849), 'ok');
  assert.equal(band(0.60), 'ok');
  assert.equal(band(0.599), 'shaky');
  assert.equal(band(0.40), 'shaky');
  assert.equal(band(0.399), 'weak');
  assert.equal(band(0.0), 'weak');
});

test('Edge Case: Elo extreme rating disparities & cold-start confidence', () => {
  // Giant rating disparity (e.g., student 2500 vs question 500 and vice versa)
  const eStrong = expected(2500, 500);
  const eWeak = expected(500, 2500);
  assert.ok(eStrong > 0.999 && eStrong < 1.0, 'Strong student expectation bounded in (0, 1)');
  assert.ok(eWeak > 0.0 && eWeak < 0.001, 'Weak student expectation bounded in (0, 1)');
  assert.ok(Math.abs((eStrong + eWeak) - 1.0) < 1e-5, 'Complementary expectations sum to 1');

  // Rating updates under 0 attempts (K=64) vs 100 attempts (K=12)
  const resCold = updateElo(1000, { rating: 1000, n: 0 }, false);
  const resWarm = updateElo(1000, { rating: 1000, n: 100 }, false);
  const shiftCold = Math.abs(resCold.question.rating - 1000);
  const shiftWarm = Math.abs(resWarm.question.rating - 1000);
  assert.ok(shiftCold > shiftWarm, `Cold question shifts more (${shiftCold} > ${shiftWarm})`);
  assert.equal(resCold.question.n, 1);
});

test('Edge Case: Concept Graph ancestry and pathUp reachability', () => {
  // Base concepts have empty ancestor sets
  assert.equal(ancestors('c6_int').size, 0);
  assert.equal(ancestors('c6_frac').size, 0);
  assert.equal(ancestors('c6_var').size, 0);

  // Transitive closure contains full chain
  const anc9 = ancestors('c9_lin2');
  assert.ok(anc9.has('c8_lineq'));
  assert.ok(anc9.has('c7_simpleeq'));
  assert.ok(anc9.has('c7_fracops'));
  assert.ok(anc9.has('c7_expr'));
  assert.ok(anc9.has('c6_frac'));
  assert.ok(anc9.has('c6_var'));

  // pathUp boundary cases
  assert.deepEqual(pathUp('c6_int', 'c6_int'), ['c6_int'], 'Self pathUp is [self]');
  const p = pathUp('c6_int', 'c9_lin2');
  assert.equal(p[0], 'c6_int');
  assert.equal(p[p.length - 1], 'c9_lin2');

  // Disconnected or reverse queries return null
  assert.equal(pathUp('c6_frac', 'c9_poly'), null, 'Unconnected concepts return null');
  assert.equal(pathUp('c9_lin2', 'c6_int'), null, 'Downward pathUp returns null');
});

test('Edge Case: Root-Cause Trace on foundational concepts with 0 prerequisites', () => {
  const s = createStudent({ id: 'base_s', grade: 6, mastery: { c6_frac: 0.2 } });
  const q = QUESTION_BY_ID.c6_frac_1;
  const wrong = q.options.find((o) => !o.correct);
  const tr = startTrace(s, q, wrong);

  // Since c6_frac has no prerequisites, nextProbe should terminate immediately
  const p = nextProbe(s, tr);
  assert.equal(p, null);
  assert.ok(tr.done);
  assert.equal(tr.reason, 'no_lower_concept');
  assert.equal(tr.root, 'c6_frac');
  assert.deepEqual(tr.climb, []);
});

test('Edge Case: Root-Cause Trace with null or unmapped misconception tags', () => {
  const s = createStudent({
    id: 's_fallback',
    grade: 8,
    mastery: { c7_simpleeq: 0.2, c7_fracops: 0.8 },
  });
  const q = QUESTION_BY_ID.c8_lineq_1;

  // Case 1: Option with null misconception tag
  const optNullTag = { id: 'dummy_null', text: { en: 'x = 0' }, correct: false, misconception: null };
  const tr1 = startTrace(s, q, optNullTag);
  const p1 = nextProbe(s, tr1);
  assert.ok(p1 !== null);
  assert.equal(p1.concept, 'c7_simpleeq', 'Falls back to weakest prerequisite c7_simpleeq');

  // Case 2: Option with unrecognized phantom misconception
  const optBogusTag = { id: 'dummy_bogus', text: { en: 'x = 0' }, correct: false, misconception: 'm_non_existent' };
  const tr2 = startTrace(s, q, optBogusTag);
  const p2 = nextProbe(s, tr2);
  assert.ok(p2 !== null);
  assert.equal(p2.concept, 'c7_simpleeq', 'Gracefully falls back to weakest prereq on bogus tag');
});

test('Edge Case: Root-Cause Trace when all prerequisites are already mastered', () => {
  // Student misses Class 9 question, but already has 0.95 mastery across all lower concepts
  const mastery = {};
  for (const c of CONCEPTS) mastery[c.id] = 0.95;
  mastery.c9_lin2 = 0.3; // only the surface concept is low

  const s = createStudent({ id: 's_all_mastered', grade: 9, mastery });
  const q = QUESTION_BY_ID.c9_lin2_1;
  const wrong = q.options.find((o) => !o.correct);
  const tr = startTrace(s, q, wrong);

  // Mastered concepts should never be probed
  const p = nextProbe(s, tr);
  assert.equal(p, null);
  assert.ok(tr.done);
  assert.equal(tr.root, 'c9_lin2', 'Designates surface concept as root when prereqs are mastered');
});

test('Edge Case: Root-Cause Trace diamond dependency deduplication', () => {
  // In our concept graph, c7_expr and c7_simpleeq both depend on c7_intops
  const s = createStudent({ id: 's_diamond', grade: 8 });
  const q = QUESTION_BY_ID.c8_brackets_1;
  const wrong = q.options.find((o) => !o.correct);
  const tr = startTrace(s, q, wrong);

  const probedConcepts = [];
  let probe = nextProbe(s, tr);
  while (probe) {
    probedConcepts.push(probe.concept);
    const wrongOpt = probe.options.find((o) => !o.correct);
    recordProbe(s, tr, probe, wrongOpt);
    probe = nextProbe(s, tr);
  }

  // Ensure no concept was probed more than once
  const counts = {};
  for (const c of probedConcepts) counts[c] = (counts[c] || 0) + 1;
  for (const c of Object.keys(counts)) {
    assert.equal(counts[c], 1, `Concept ${c} must not be probed multiple times`);
  }
});

test('Edge Case: Root-Cause Trace with probe pool exhaustion and recency fallback', () => {
  const s = createStudent({ id: 's_exhausted', grade: 7 });
  // Saturate the student's recent attempts with every probe question in the target concept
  const targetConcept = 'c7_intops';
  const targetQuestions = questionsFor(targetConcept);
  for (const q of targetQuestions) {
    s.attempts.push({ q: q.id, correct: false });
  }

  const q = QUESTION_BY_ID.c8_brackets_1;
  const wrong = q.options.find((o) => o.misconception === 'm_sub_neg') || q.options.find((o) => !o.correct);
  const tr = startTrace(s, q, wrong);
  tr.candidate = targetConcept;

  // nextProbe must not return null or crash; it should fall back to the author probe
  const probe = nextProbe(s, tr);
  assert.ok(probe !== null, 'Probe question must be returned even when all questions were recent');
  assert.equal(probe.concept, targetConcept);
});

test('Edge Case: Root-Cause Trace all probes answered correctly (prereqs intact)', () => {
  const s = createStudent({
    id: 's_intact',
    grade: 8,
    mastery: { c7_expr: 0.3, c7_intmul: 0.3 },
  });
  const q = QUESTION_BY_ID.c8_brackets_1;
  const wrong = q.options.find((o) => !o.correct);
  const tr = startTrace(s, q, wrong);

  // Student answers every diagnostic probe correctly
  let probe = nextProbe(s, tr);
  while (probe) {
    const correctOpt = probe.options.find((o) => o.correct);
    recordProbe(s, tr, probe, correctOpt);
    probe = nextProbe(s, tr);
  }

  assert.ok(tr.done);
  assert.equal(tr.reason, 'prereqs_intact');
  assert.equal(tr.root, 'c8_brackets', 'Root is the parent concept itself since prereqs are intact');
});

test('Edge Case: Question Selector cold-start, all-mastered, and teacher overrides', () => {
  const qstats = {};

  // Case 1: Fresh cold start student -> gets a foundational Class 6 concept with 0 prereqs
  const sCold = createStudent({ id: 'cold_s', grade: 6 });
  const coldConcept = nextConcept(sCold);
  assert.ok(['c6_int', 'c6_frac', 'c6_var'].includes(coldConcept), 'Cold start chooses a base concept');

  // Case 2: Mastered all 12 concepts -> falls back to highest-grade concept without crashing
  const sMaster = createStudent({ id: 'master_s', grade: 9 });
  for (const c of CONCEPTS) sMaster.mastery[c.id].p = 0.95;
  const masterConcept = nextConcept(sMaster);
  assert.equal(masterConcept, CONCEPTS[CONCEPTS.length - 1].id, 'Mastered student gets highest concept');

  // Case 3: Teacher override wins
  sCold.focus = 'c8_lineq';
  assert.equal(nextConcept(sCold), 'c8_lineq', 'Teacher focus override takes precedence');

  // Case 4: Class focus parameter
  sCold.focus = null;
  const classFocus = nextConcept(sCold, 'c6_var');
  assert.equal(classFocus, 'c6_var', 'Class focus chosen when student has not mastered it');
});

test('Edge Case: Question Selector dynamic target streak adjustments', () => {
  const s = createStudent({ id: 'streak_s', grade: 8 });
  const qstats = {};

  // Initial state: normal target (0.70)
  assert.deepEqual(currentTarget(s), { key: 'normal', p: TARGET.normal });

  // 3 consecutive practice correct -> pushes target to harder (0.55)
  for (let i = 0; i < 3; i++) {
    recordAnswer(s, qstats, 'c7_intops_1', QUESTION_BY_ID.c7_intops_1.options.find((o) => o.correct).id, { mode: 'practice' });
  }
  assert.deepEqual(currentTarget(s), { key: 'harder', p: TARGET.harder });

  // 1 incorrect answer -> returns to normal (0.70)
  recordAnswer(s, qstats, 'c7_intops_2', QUESTION_BY_ID.c7_intops_2.options.find((o) => !o.correct).id, { mode: 'practice' });
  assert.deepEqual(currentTarget(s), { key: 'normal', p: TARGET.normal });

  // Second consecutive incorrect answer -> softens target to easier (0.85)
  recordAnswer(s, qstats, 'c7_intops_3', QUESTION_BY_ID.c7_intops_3.options.find((o) => !o.correct).id, { mode: 'practice' });
  assert.deepEqual(currentTarget(s), { key: 'easier', p: TARGET.easier });

  // Non-practice modes (e.g., probe) should not affect streak
  s.attempts.push({ q: 'probe_q', correct: true, mode: 'probe' });
  assert.deepEqual(currentTarget(s), { key: 'easier', p: TARGET.easier }, 'Probes do not affect practice target');
});

test('Edge Case: Question Selector pool exhaustion fallback & easierTwin boundary', () => {
  const s = createStudent({ id: 'pool_s', grade: 7 });
  const qstats = {};
  const concept = 'c7_intmul';
  const allQuestions = questionsFor(concept);

  // Exclude all available questions
  const q = pickQuestion(s, qstats, concept, { exclude: allQuestions.map((q) => q.id) });
  assert.ok(q !== undefined && q.concept === concept, 'pickQuestion returns a question even when all are excluded');

  // easierTwin: returns an easier question from the same concept
  const testQ = QUESTION_BY_ID.c7_intmul_1;
  const twin = easierTwin(s, qstats, testQ);
  assert.ok(twin !== null);
  assert.notEqual(twin.id, testQ.id);
  assert.equal(twin.concept, testQ.concept);
});

test('Edge Case: Spaced Repetition Leitner Box 5 clamping, reset, and assisted attempts', () => {
  const now = 1000000;
  let entry = { box: 1, due: undefined };

  // Step from Box 1 to Box 5
  for (let expectedBox = 2; expectedBox <= 5; expectedBox++) {
    entry = scheduleReview(entry, true, now);
    assert.equal(entry.box, expectedBox);
    assert.equal(entry.due, now + BOX_DAYS[expectedBox] * 86400000);
  }

  // Box 5 clamp: further correct answers remain in Box 5
  entry = scheduleReview(entry, true, now);
  assert.equal(entry.box, 5, 'Box 5 does not overflow');

  // Hard reset on miss: drops straight from Box 5 to Box 1
  entry = scheduleReview(entry, false, now);
  assert.equal(entry.box, 1, 'Wrong answer drops directly to Box 1');

  // isDue checks
  assert.equal(isDue(null, now), false);
  assert.equal(isDue({}, now), false);
  assert.equal(isDue({ due: now + 5000 }, now), false, 'Future due is not due');
  assert.equal(isDue({ due: now - 1 }, now), true, 'Past due is due');
  assert.equal(isDue({ due: now }, now), true, 'Exact due is due');

  // Assisted attempt in recordAnswer should NOT advance review
  const s = createStudent({ id: 'assist_s', grade: 7 });
  const qstats = {};
  const correctOpt = QUESTION_BY_ID.c7_intops_1.options.find((o) => o.correct).id;
  recordAnswer(s, qstats, 'c7_intops_1', correctOpt, { hintsUsed: 2, now });
  assert.equal(s.mastery.c7_intops.box, 1, 'Assisted correct answer does not advance review box');
});

test('Edge Case: Warm-Up generation boundaries (0, 1, and many reviews due)', () => {
  const s = createStudent({ id: 'warmup_s', grade: 7 });
  const qstats = {};
  const now = 2000000;

  // Case 1: 0 reviews due -> only 1 question (today's concept)
  const set0 = warmUp(s, qstats, 'c7_intops', now);
  assert.equal(set0.questions.length, 1);
  assert.equal(set0.questions[0].concept, 'c7_intops');
  assert.equal(set0.today, 'c7_intops');
  assert.deepEqual(set0.review, []);

  // Case 2: 1 review due -> 2 questions
  s.mastery.c6_int.p = 0.8;
  s.mastery.c6_int.due = now - 1000;
  const set1 = warmUp(s, qstats, 'c7_intops', now);
  assert.equal(set1.questions.length, 2);
  assert.deepEqual(set1.review, ['c6_int']);

  // Case 3: 5 reviews due -> capped at at most 3 questions
  for (const cid of ['c6_frac', 'c6_var', 'c7_intmul', 'c7_fracops']) {
    s.mastery[cid].p = 0.8;
    s.mastery[cid].due = now - 1000;
  }
  const setMulti = warmUp(s, qstats, 'c7_intops', now);
  assert.equal(setMulti.questions.length, 3, 'Warm-up is capped at 3 questions');
  assert.equal(setMulti.review.length, 2);
});

test('Edge Case: Teacher Analytics rootGap boundary & zero-gap class', () => {
  // Case 1: Student with no weak concepts
  const sStrong = createStudent({ id: 'strong_s', grade: 8 });
  for (const c of CONCEPTS) sStrong.mastery[c.id].p = 0.75;
  assert.equal(rootGap(sStrong), null, 'Strong student has null rootGap');

  // Case 2: Chain of weak concepts: c8_lineq is weak, but its prereq c7_simpleeq is also weak
  const masteryChain = {};
  for (const c of CONCEPTS) masteryChain[c.id] = 0.8;
  masteryChain.c8_lineq = 0.2;
  masteryChain.c7_simpleeq = 0.2;
  const sChain = createStudent({ id: 'chain_s', grade: 8, mastery: masteryChain });
  // The root gap must be c7_simpleeq, NOT c8_lineq!
  assert.equal(rootGap(sChain), 'c7_simpleeq');

  // Case 3: Empty student list
  assert.deepEqual(rootGapCounts([]), []);
  const briefEmpty = morningBrief([]);
  assert.equal(briefEmpty.top, null);
  assert.equal(briefEmpty.topCount, 0);
  assert.deepEqual(briefEmpty.counts, []);
  assert.deepEqual(briefEmpty.pairs, []);
});

test('Edge Case: Teacher Operations buddy pairing asymmetries & max capping', () => {
  assert.deepEqual(buddyPairs([], 'c6_int'), [], 'Empty students yields empty pairs');

  const helpers = [
    createStudent({ id: 'h1', grade: 9, mastery: { c6_int: 0.95 } }),
    createStudent({ id: 'h2', grade: 9, mastery: { c6_int: 0.92 } }),
    createStudent({ id: 'h3', grade: 9, mastery: { c6_int: 0.90 } }),
  ];
  const learners = [
    createStudent({ id: 'l1', grade: 9, mastery: { c6_int: 0.10 } }),
    createStudent({ id: 'l2', grade: 9, mastery: { c6_int: 0.15 } }),
  ];

  // 3 helpers, 2 learners -> exactly 2 pairs
  const pairs2 = buddyPairs([...helpers, ...learners], 'c6_int');
  assert.equal(pairs2.length, 2);
  assert.equal(pairs2[0].helper.id, 'h1');
  assert.equal(pairs2[0].learner.id, 'l1');

  // Max capping parameter
  const cappedPairs = buddyPairs([...helpers, ...learners], 'c6_int', 1);
  assert.equal(cappedPairs.length, 1);

  // All learners (0 helpers) -> 0 pairs
  assert.deepEqual(buddyPairs(learners, 'c6_int'), []);

  // All helpers (0 learners) -> 0 pairs
  assert.deepEqual(buddyPairs(helpers, 'c6_int'), []);
});

test('Edge Case: Teacher Operations idle and multi-gap alerts', () => {
  const now = 10000000;
  const day = 86400000;

  // Student inactive for 6 days
  const sIdle = createStudent({ id: 'idle_s', grade: 8 });
  sIdle.lastActive = now - 6 * day;

  // Student active today but with 6 weak concepts
  const sStruggle = createStudent({ id: 'struggle_s', grade: 8 });
  sStruggle.lastActive = now;
  for (const cid of ['c6_int', 'c6_frac', 'c6_var', 'c7_intops', 'c7_intmul', 'c7_expr']) {
    sStruggle.mastery[cid].p = 0.2;
  }

  // Healthy student (all concepts mastered)
  const sHealthy = createStudent({ id: 'healthy_s', grade: 8 });
  for (const c of CONCEPTS) sHealthy.mastery[c.id].p = 0.8;
  sHealthy.lastActive = now;

  const result = alerts([sIdle, sStruggle, sHealthy], now);
  assert.equal(result.length, 2);
  assert.ok(result.some((a) => a.student.id === 'idle_s' && a.kind === 'idle'));
  assert.ok(result.some((a) => a.student.id === 'struggle_s' && a.kind === 'many_gaps'));
});

test('Edge Case: Option Randomization edge inputs (null, empty, single-option, empty seed)', () => {
  assert.deepEqual(shuffleOptions(null), []);
  assert.deepEqual(shuffleOptions([]), []);
  const single = [{ id: 'opt1' }];
  assert.deepEqual(shuffleOptions(single), single);

  // Empty or weird seedKey runs safely without error
  const sample = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const shufEmpty = shuffleOptions(sample, '');
  assert.equal(shufEmpty.length, 4);

  // 100 repeated calls with identical seed produce identical order
  const seed = 'test:sample:1';
  const baseline = shuffleOptions(sample, seed);
  for (let i = 0; i < 100; i++) {
    assert.deepEqual(shuffleOptions(sample, seed), baseline);
  }
});

test('Edge Case: Student state recordAnswer unrecognized option & atomicity', () => {
  const s = createStudent({ id: 'rec_s', grade: 8 });
  const qstats = {};
  const initRating = s.rating;
  const initP = s.mastery.c7_intops.p;

  // Answering with a nonexistent option ID
  const res = recordAnswer(s, qstats, 'c7_intops_1', 'bogus_option_id');
  assert.equal(res.correct, false);
  assert.equal(res.option, undefined);
  assert.ok(s.rating < initRating, 'Rating drops on unrecognized option');
  assert.ok(s.mastery.c7_intops.p < initP, 'BKT drops on unrecognized option');
  assert.equal(s.attempts.length, 1);
  assert.equal(s.attempts[0].misconception, null);
});

test('Edge Case: Offline Scripted Chotu normalization, multi-language fallback, and empty input', () => {
  // Normalization converts en/em-dashes and strips whitespace
  assert.equal(normalise('  −5X   –   10  '), ' -5x - 10 ');

  // Empty student input
  const ideas = RUBRICS.c6_int.ideas;
  const emptyRes = scriptedTurn({ text: '', ideas, covered: [], lang: 'en', turn: 0 });
  assert.equal(emptyRes.done, false);
  assert.equal(emptyRes.covered.length, 0);
  assert.ok(emptyRes.reply.includes('didn’t get that'));

  // Multi-language fallback for unknown language code
  const fallbackRes = scriptedTurn({ text: 'right on number line', ideas, covered: [], lang: 'fr', turn: 0 });
  assert.ok(fallbackRes.reply.length > 0);

  // Full rubric coverage in single turn
  const fullText = 'negative numbers are left of 0 and less than 0, further right is bigger on the number line, for example debt';
  const fullRes = scriptedTurn({ text: fullText, ideas, covered: [], lang: 'en', turn: 0 });
  assert.ok(fullRes.done, 'Chotu recognizes full rubric completion');
  assert.ok(fullRes.reply.includes('totally get it'));
});

console.log(`\n${passed} checks passed`);
