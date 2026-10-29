// Concept graph (a DAG) for the Numbers → Algebra strand, Classes 6–9.
// Mapped to NCERT Mathematics chapters. `prereqs` are the edges of the graph:
// a concept can only be learned well once its prerequisites are in place.
// Table: concepts + concept_prereqs (see schema.sql)

export const CONCEPTS = [
  {
    id: 'c6_int', grade: 6, ncert: 'Class 6 · Ch 6 Integers',
    name: { en: 'Negative numbers & the number line', hi: 'ऋणात्मक संख्याएँ और संख्या रेखा' },
    prereqs: [],
  },
  {
    id: 'c6_frac', grade: 6, ncert: 'Class 6 · Ch 7 Fractions',
    name: { en: 'Fractions', hi: 'भिन्न' },
    prereqs: [],
  },
  {
    id: 'c6_var', grade: 6, ncert: 'Class 6 · Ch 11 Algebra',
    name: { en: 'Letters for numbers', hi: 'संख्याओं के लिए अक्षर' },
    prereqs: [],
  },
  {
    id: 'c7_intops', grade: 7, ncert: 'Class 7 · Ch 1 Integers',
    name: { en: 'Adding & subtracting integers', hi: 'पूर्णांकों का जोड़ और घटाव' },
    prereqs: ['c6_int'],
  },
  {
    id: 'c7_intmul', grade: 7, ncert: 'Class 7 · Ch 1 Integers',
    name: { en: 'Multiplying & dividing integers', hi: 'पूर्णांकों का गुणा और भाग' },
    prereqs: ['c7_intops'],
  },
  {
    id: 'c7_fracops', grade: 7, ncert: 'Class 7 · Ch 2 Fractions & Decimals',
    name: { en: 'Operations on fractions', hi: 'भिन्नों पर संक्रियाएँ' },
    prereqs: ['c6_frac'],
  },
  {
    id: 'c7_expr', grade: 7, ncert: 'Class 7 · Ch 12 Algebraic Expressions',
    name: { en: 'Algebraic expressions & like terms', hi: 'बीजीय व्यंजक और समान पद' },
    prereqs: ['c6_var', 'c7_intops'],
  },
  {
    id: 'c7_simpleeq', grade: 7, ncert: 'Class 7 · Ch 4 Simple Equations',
    name: { en: 'Simple equations', hi: 'सरल समीकरण' },
    prereqs: ['c7_expr', 'c7_intops'],
  },
  {
    id: 'c8_lineq', grade: 8, ncert: 'Class 8 · Ch 2 Linear Equations',
    name: { en: 'Linear equations in one variable', hi: 'एक चर वाले रैखिक समीकरण' },
    prereqs: ['c7_simpleeq', 'c7_fracops'],
  },
  {
    id: 'c8_brackets', grade: 8, ncert: 'Class 8 · Ch 9 Algebraic Expressions & Identities',
    name: { en: 'Expanding brackets', hi: 'कोष्ठक खोलना' },
    prereqs: ['c7_expr', 'c7_intmul'],
  },
  {
    id: 'c9_poly', grade: 9, ncert: 'Class 9 · Ch 2 Polynomials',
    name: { en: 'Value of a polynomial', hi: 'बहुपद का मान' },
    prereqs: ['c8_brackets', 'c7_intmul'],
  },
  {
    id: 'c9_lin2', grade: 9, ncert: 'Class 9 · Ch 4 Linear Equations in Two Variables',
    name: { en: 'Linear equations in two variables', hi: 'दो चर वाले रैखिक समीकरण' },
    prereqs: ['c8_lineq'],
  },
];

export const CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));

// Children = concepts that depend directly on this one (used for "climb back up").
export function dependents(conceptId) {
  return CONCEPTS.filter((c) => c.prereqs.includes(conceptId)).map((c) => c.id);
}

// All concepts that sit underneath `conceptId` in the graph (transitive prereqs).
export function ancestors(conceptId, seen = new Set()) {
  for (const p of CONCEPT_BY_ID[conceptId].prereqs) {
    if (!seen.has(p)) {
      seen.add(p);
      ancestors(p, seen);
    }
  }
  return seen;
}

// Shortest prerequisite path from `low` up to `high` (inclusive), or null.
export function pathUp(low, high) {
  const queue = [[high]];
  const seen = new Set([high]);
  while (queue.length) {
    const path = queue.shift();
    const head = path[0];
    if (head === low) return path;
    for (const p of CONCEPT_BY_ID[head].prereqs) {
      if (!seen.has(p)) {
        seen.add(p);
        queue.push([p, ...path]);
      }
    }
  }
  return null;
}
