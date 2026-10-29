// Validation run: 700 simulated students with planted gaps (+200 for practice).
//   npm run simulate
// Writes the results to src/data/validation-results.json (shown in the app's
// "Validation" tab) and prints a summary.
//
// What we measure
//  A. Root-Cause Trace accuracy: does the trace find the planted root gap?
//     Compared with two simple baselines.
//  B. Mastery prediction (BKT + Elo blend): how well do we predict whether
//     the next answer will be right? (AUC, Brier score)
//  C. Elo cold start: prediction quality on a brand-new question bank, our
//     blended approach vs. plain Elo starting every question at 1000.
//  D. Difficulty targeting: during adaptive practice, how close is the real
//     success rate to the 70% target?
//
// Honest caveat: these are SIMULATED students. They show the algorithms do
// what they are designed to do; they are not evidence of learning gains with
// real children. That is what the Prove round pilot is for.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CONCEPTS, CONCEPT_BY_ID } from '../src/data/concepts.js';
import { QUESTIONS, questionsFor } from '../src/data/questions.js';
import { createStudent, recordAnswer, recordLesson } from '../src/engine/student.js';
import { runTrace } from '../src/engine/trace.js';
import { nextConcept, pickQuestion, successChance } from '../src/engine/selector.js';
import { makeSimStudent, rng, descendants, ROOT_CHOICES } from '../src/engine/sim.js';
import { expected } from '../src/engine/elo.js';

const N = 200;        // students in the practice experiment
const N_TRACE = 700;  // 100 students per planted root
const rand = rng(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pct = (x) => Math.round(x * 1000) / 10;

// ─────────────────────────── A. Root-Cause Trace ───────────────────────────
function traceExperiment(warm) {
  let exact = 0, followUp = 0, onBroken = 0, probes = 0, probes2 = 0, baselineStep = 0, runs = 0;
  const byRoot = {};
  for (let i = 0; i < N_TRACE; i++) {
    const root = ROOT_CHOICES[i % ROOT_CHOICES.length];
    const sim = makeSimStudent([root], rand);
    const s = createStudent({ id: `v${i}`, name: 'sim', grade: 9, mastery: Object.fromEntries(CONCEPTS.map((c) => [c.id, 0.5])) });
    const qstats = {};
    if (warm) {
      // One earlier answer per concept, like a short placement check.
      for (const c of CONCEPTS) { const q = pick(questionsFor(c.id)); recordAnswer(s, qstats, q.id, sim.answer(q).id); }
    }
    // Start from a Class 8–9 concept that sits on top of the planted gap.
    const above = [...descendants(root)].filter((c) => c !== root && CONCEPT_BY_ID[c].grade >= 8);
    if (!above.length) continue;
    const start = pick(above);
    // The student meets a question on it and gets it wrong.
    let q, opt, tries = 0;
    do { q = pick(questionsFor(start)); opt = sim.answer(q); tries++; } while (opt.correct && tries < 10);
    if (opt.correct) continue;
    runs++;
    const trace = runTrace(s, q, opt, (pq) => sim.answer(pq));
    const hit = trace.root === root;
    exact += hit ? 1 : 0;
    // Follow-up: if the trace ran out of probes, the next session starts with
    // a check on the found root; a miss continues the trace further down.
    let finalRoot = trace.root;
    if (trace.reason === 'max_probes') {
      const cq = pick(questionsFor(trace.root));
      const co = sim.answer(cq);
      if (!co.correct) {
        const t2 = runTrace(s, cq, co, (pq) => sim.answer(pq));
        finalRoot = t2.root;
        probes2 += t2.probes.length + 1;
      }
    }
    followUp += finalRoot === root ? 1 : 0;
    onBroken += sim.known.has(trace.root) ? 0 : 1;
    probes += trace.probes.length;
    // Baseline: "step back one chapter" — a random direct prerequisite.
    const prereqs = CONCEPT_BY_ID[start].prereqs;
    baselineStep += pick(prereqs) === root ? 1 : 0;
    byRoot[root] = byRoot[root] || { n: 0, hit: 0 };
    byRoot[root].n++; byRoot[root].hit += hit ? 1 : 0;
  }
  return {
    runs,
    rootAccuracy: pct(exact / runs),
    rootAccuracyWithFollowUp: pct(followUp / runs),
    avgFollowUpQuestions: Math.round((probes2 / runs) * 100) / 100,
    landedOnBrokenConcept: pct(onBroken / runs),
    avgProbes: Math.round((probes / runs) * 100) / 100,
    baselineRedrillChapter: 0, // re-drilling the failed chapter never finds an earlier root
    baselineOneStepBack: pct(baselineStep / runs),
    byRoot: Object.fromEntries(Object.entries(byRoot).map(([k, v]) => [k, pct(v.hit / v.n)])),
  };
}

// ─────────────────── B + D. Adaptive practice & prediction ───────────────────
function auc(pairs) {
  const pos = pairs.filter((p) => p.y === 1).map((p) => p.p);
  const neg = pairs.filter((p) => p.y === 0).map((p) => p.p);
  let wins = 0;
  for (const a of pos) for (const b of neg) wins += a > b ? 1 : a === b ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}
const brier = (pairs) => pairs.reduce((s, p) => s + (p.p - p.y) ** 2, 0) / pairs.length;

function practiceExperiment() {
  const qstats = {};          // brand-new question bank: cold start
  const naive = {};           // plain Elo: every question starts at 1000, K = 32
  const ours = [], plainElo = [], all = [];
  let practiceCorrect = 0, practiceN = 0;
  for (let i = 0; i < N; i++) {
    const roots = rand() < 0.8 ? [pick(ROOT_CHOICES)] : [];
    const sim = makeSimStudent(roots, rand);
    const s = createStudent({ id: `p${i}`, name: 'sim', grade: 9, mastery: Object.fromEntries(CONCEPTS.map((c) => [c.id, 0.5])) });
    let naiveTheta = 1000;
    for (let step = 0; step < 40; step++) {
      const c = step < 12 ? CONCEPTS[step].id : nextConcept(s);
      const q = step < 12 ? pick(questionsFor(c)) : pickQuestion(s, qstats, c);
      const p = successChance(s, qstats, q);
      const nq = naive[q.id] ?? 1000;
      const pn = expected(naiveTheta, nq);
      const opt = sim.answer(q);
      const y = opt.correct ? 1 : 0;
      all.push({ p, y });
      if (i < 20) { ours.push({ p, y }); plainElo.push({ p: pn, y }); }
      const e = pn;
      naiveTheta += 32 * (y - e);
      naive[q.id] = nq - 32 * (y - e);
      if (step >= 12) { practiceN++; practiceCorrect += y; }
      recordAnswer(s, qstats, q.id, opt.id);
      // Learning: a wrong answer is followed by a hint/lesson.
      if (!y) { sim.learn(c, 1); if (rand() < 0.3) recordLesson(s, c); }
    }
  }
  return {
    prediction: { answers: all.length, auc: Math.round(auc(all) * 1000) / 1000, brier: Math.round(brier(all) * 1000) / 1000 },
    coldStart: {
      firstAnswers: ours.length,
      oursBrier: Math.round(brier(ours) * 1000) / 1000,
      plainEloBrier: Math.round(brier(plainElo) * 1000) / 1000,
      oursAuc: Math.round(auc(ours) * 1000) / 1000,
      plainEloAuc: Math.round(auc(plainElo) * 1000) / 1000,
    },
    targeting: { target: 70, actualSuccessRate: pct(practiceCorrect / practiceN), practiceAnswers: practiceN },
  };
}

// ────────────────────────────── run ──────────────────────────────
const cold = traceExperiment(false);
const warm = traceExperiment(true);
const practice = practiceExperiment();

const results = {
  generatedAt: new Date().toISOString(),
  students: N_TRACE,
  practiceStudents: N,
  questionBank: QUESTIONS.length,
  concepts: CONCEPTS.length,
  trace: { newStudent: cold, afterPlacement: warm },
  ...practice,
};

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, '../src/data/validation-results.json'), JSON.stringify(results, null, 2));

console.log('\nSutra validation — simulated students\n');
console.log('A. Root-Cause Trace (planted gap found exactly)');
console.log(`   New student (no history):   ${cold.rootAccuracy}%  over ${cold.runs} runs, ${cold.avgProbes} probes on average`);
console.log(`   After a 12-question check:  ${warm.rootAccuracy}%  over ${warm.runs} runs, ${warm.avgProbes} probes on average`);
console.log(`   With the next-session follow-up check: ${cold.rootAccuracyWithFollowUp}% / ${warm.rootAccuracyWithFollowUp}%`);
console.log(`   Landed on a concept the student truly lacks: ${cold.landedOnBrokenConcept}% / ${warm.landedOnBrokenConcept}%`);
console.log(`   Baselines: re-drill the chapter 0%, step back one chapter ${cold.baselineOneStepBack}%`);
console.log('   By planted root:', cold.byRoot);
console.log('\nB. Predicting the next answer (BKT + Elo blend)');
console.log(`   AUC ${practice.prediction.auc}, Brier ${practice.prediction.brier} over ${practice.prediction.answers} answers`);
console.log('\nC. Elo cold start (first 20 students on a brand-new bank)');
console.log(`   Ours: Brier ${practice.coldStart.oursBrier}, AUC ${practice.coldStart.oursAuc}`);
console.log(`   Plain Elo from 1000: Brier ${practice.coldStart.plainEloBrier}, AUC ${practice.coldStart.plainEloAuc}  (lower Brier is better)`);
console.log('\nD. Difficulty targeting');
console.log(`   Target 70%, actual ${practice.targeting.actualSuccessRate}% over ${practice.targeting.practiceAnswers} practice answers\n`);
