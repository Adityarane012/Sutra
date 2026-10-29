// Student state and the single place where an answer is recorded.
// Every answer updates: BKT mastery, Elo ratings, the review schedule and the
// attempts log. Mirrors the tables students, mastery and attempts in schema.sql.

import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { QUESTION_BY_ID } from '../data/questions.js';
import { BKT, updateMastery, afterLesson } from './bkt.js';
import { priorRating, studentStartRating, updateElo } from './elo.js';
import { scheduleReview } from './review.js';

export function createStudent({ id, name, grade, classId = '9B', lang = 'en', mastery = {} }) {
  const m = {};
  for (const c of CONCEPTS) {
    m[c.id] = { p: mastery[c.id] ?? BKT.pInit, n: 0, correct: 0, box: 1, due: undefined };
  }
  return {
    id, name, grade, classId, lang,
    rating: studentStartRating(grade),
    mastery: m,
    attempts: [],
    teachbacks: [],
    rootsFixed: [],
    focus: null,          // teacher override for this student
    lastActive: Date.now(),
  };
}

export const pKnown = (student, conceptId) => student.mastery[conceptId]?.p ?? BKT.pInit;

/** Get (or create from the prior) the Elo stats for a question. */
export function qStat(qstats, question) {
  if (!qstats[question.id]) {
    const grade = CONCEPT_BY_ID[question.concept].grade;
    qstats[question.id] = { rating: priorRating(question, grade), n: 0 };
  }
  return qstats[question.id];
}

/**
 * Record one answer. Mutates `student` and `qstats` (simple and fast; the UI
 * store clones before calling). Returns info about what happened.
 */
export function recordAnswer(student, qstats, questionId, optionId, { hintsUsed = 0, mode = 'practice', now = Date.now() } = {}) {
  const q = QUESTION_BY_ID[questionId];
  const option = q.options.find((o) => o.id === optionId);
  const correct = !!option?.correct;
  const entry = student.mastery[q.concept];
  const before = entry.p;

  entry.p = updateMastery(entry.p, correct, { hintsUsed });
  entry.n += 1;
  if (correct) entry.correct += 1;
  Object.assign(entry, scheduleReview(entry, correct && hintsUsed === 0, now));

  const elo = updateElo(student.rating, qStat(qstats, q), correct);
  student.rating = elo.student;
  qstats[q.id] = elo.question;

  student.attempts.push({
    q: q.id, o: optionId, c: q.concept, correct, hintsUsed, mode,
    misconception: option?.misconception ?? null, t: now,
  });
  student.lastActive = now;
  return { correct, option, question: q, before, after: entry.p };
}

export function recordLesson(student, conceptId) {
  const e = student.mastery[conceptId];
  e.p = afterLesson(e.p);
}
