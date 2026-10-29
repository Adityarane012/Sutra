// Elo ratings for question difficulty (as in chess, but student vs question).
// When a student gets a question wrong, the question's rating goes up (it is
// harder than we thought) and the student's goes down, and vice versa.
//
// COLD START on a small question bank — four safeguards:
//  1. Informed prior: a new question starts from its grade + author level,
//     not from a flat 1000.
//  2. Decaying K-factor: early attempts move the rating a lot, later ones
//     only a little, so it settles instead of bouncing around.
//  3. Confidence blend: when choosing questions, a rating backed by few
//     attempts is trusted less; until a question has enough attempts the
//     selector leans on the student's BKT mastery instead (see selector.js).
//  4. Seeding: ratings are warmed up from earlier attempts (in this demo,
//     the seeded class), so day one is not a blank slate.

export const ELO = {
  base: 1000,
  perGrade: 120,     // a Class 7 question starts 120 above a Class 6 one
  perLevel: 80,      // author level 1/2/3 shifts it by ±80
  kStudent: 32,
  kQuestionMax: 64,
  kQuestionMin: 12,
  confidenceAt: 20,  // attempts at which we trust the rating ~50%
};

export function priorRating(question, grade) {
  return ELO.base + (grade - 6) * ELO.perGrade + (question.level - 2) * ELO.perLevel;
}

export function studentStartRating(grade) {
  // A student is expected to be about level-2 strength in their own grade.
  return ELO.base + (grade - 6) * ELO.perGrade;
}

export function expected(studentRating, questionRating) {
  return 1 / (1 + Math.pow(10, (questionRating - studentRating) / 400));
}

export function kQuestion(n) {
  return Math.max(ELO.kQuestionMin, ELO.kQuestionMax / (1 + n / 10));
}

/** Confidence in a question's rating after n attempts (0 → 1). */
export function confidence(n) {
  return n / (n + ELO.confidenceAt);
}

/**
 * One Elo update. Returns the new student rating and question stats.
 * `qStat` = { rating, n } for the question.
 */
export function updateElo(studentRating, qStat, correct) {
  const e = expected(studentRating, qStat.rating);
  const score = correct ? 1 : 0;
  return {
    student: studentRating + ELO.kStudent * (score - e),
    question: {
      rating: qStat.rating - kQuestion(qStat.n) * (score - e),
      n: qStat.n + 1,
    },
  };
}
