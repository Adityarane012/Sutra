# Sutra — find the thread, fix the root

An adaptive learning prototype for Classes 6–10 (Code Kernel ’26). When a student gets a question wrong, Sutra traces the mistake back to the concept where it started, even several grades earlier. It fixes that concept first, then climbs back up to the original question. It also gives the teacher a 2-minute morning brief.

Prototype scope: maths, Numbers → Algebra strand, Classes 6–9. 12 NCERT concepts, 60 misconception-tagged questions, English + Hindi.

## Run it

```bash
npm install
npm run dev          # opens http://localhost:5173
```

Other commands:

```bash
npm test             # engine checks
npm run simulate     # validation run with simulated students (updates the "How it works" tab)
npm run build        # production build in dist/ (works offline after first load)
npm run preview      # serve the production build
```

**AI Chotu (optional):** copy `.env.example` to `.env` and add a free Gemini API key. Without a key, or with no internet, Chotu runs in offline mode with a scripted rubric. The app shows which mode is active.

Demo PIN for both students is **1234**. “Reset demo” (click twice) restores the starting data.

## 3-minute demo script

1. **Student → Riya (PIN 1234).** The app opens in Hindi, Riya’s saved language; switch with **EN / हिं**. Her thread shows a gap in Class 6 negative numbers.
2. **Try the Class 9 question.** Pick **x = 8/3**. This is wrong, and it is tagged with the misconception “treats a − (−b) as a − b”.
3. **Root-Cause Trace.** Probe 1 is Class 7, `4 − (−3)`: pick **1**. Probe 2 is Class 6, `−3 or 2`: pick **−3**. Sutra finds the root: Class 6 negative numbers.
4. **2-minute lesson.** It has a number line, plus “explain another way” (worked example or everyday story). Then answer the check question, the Class 7 climb-back question, and the original question again: thread repaired.
5. **Teach it to Chotu.** Explain in English, Hindi or Hinglish, and watch the rubric checklist fill in.
6. **Teacher tab.** The morning brief shows, for example, “8 of 31 share one root gap”, a re-teach idea, buddy pairs and Riya’s live result. **Approve plan**, then open the **Class heatmap**, click **Riya**, and see her misconceptions and Chotu transcript. **Worksheets** has a printable sheet per student.
7. **How it works tab.** Shows the validation numbers and the data model.

## What changed after the Decode review

| Review point | What the prototype does |
|---|---|
| Show the actual data schema | `schema.sql`: real PostgreSQL tables, keys, checks and row-level-security policies. The app keeps the same shape in the browser. |
| Elo cold start on a small bank | `src/engine/elo.js` has four safeguards: (1) starting rating from grade + author level, (2) a decaying K-factor, (3) a trust weight that falls back to BKT until a question has enough attempts, (4) ratings seeded from earlier attempts. These were measured in the simulation: Brier 0.195 vs 0.206 for plain Elo on a brand-new bank. |
| Validation already run | `npm run simulate` runs 700 simulated students with planted gaps, plus 200 for practice. The results are below and in the app. |

## Validation results (simulated students)

| What | Result |
|---|---|
| Trace points to a concept the student truly lacks | **92–93%** |
| Exact planted root found in one session (≤3 probes, avg 2.6) | **43%** |
| … after a placement check + next-session follow-up | **54%** |
| Baseline: re-drill the failed chapter | 0% |
| Baseline: go back one chapter | 15% |
| Predicting the next answer (BKT + Elo) | AUC **0.74** |
| Cold start, brand-new bank: ours vs plain Elo (Brier, lower is better) | **0.195** vs 0.206 |
| Real success rate in practice vs 70% target | 61% |

**Honest reading:**
- Simulated students show that the algorithms do what they are designed to do. They are not proof that real children learn more. That is what the Prove-round pilot is for.
- The simulation also showed where to improve next:
  - Gaps in “letters for numbers” and fractions are found less often, because few Class 8–9 questions carry misconception tags pointing to them.
  - Practice lands below the 70% target because each concept has only 5 questions to choose from.

## How it works

| Piece | File | What it does |
|---|---|---|
| Concept graph | `src/data/concepts.js` | NCERT concepts with prerequisite links (a DAG) |
| Misconception tags | `src/data/misconceptions.js`, `questions.js` | Each wrong option names the misconception behind it and where that misconception lives |
| Root-Cause Trace | `src/engine/trace.js` | ≤3 probes down the graph, guided by tags. It skips mastered concepts, checks the other prerequisites when a probe passes, and continues next session if probes run out |
| Mastery | `src/engine/bkt.js` | Bayesian Knowledge Tracing: guess 20%, slip 10%, learn 15% per step. Hints weaken the evidence |
| Difficulty | `src/engine/elo.js`, `selector.js` | Aims for ~70% success: 55% after 3 in a row, 85% after 2 misses. Elo and BKT are blended by trust |
| What next | `src/engine/selector.js` | Teacher override first, then the weakest concept whose prerequisites are mastered |
| Spaced review | `src/engine/review.js` | Leitner boxes at 1, 3, 7, 14 and 30 days. Warm-up = today’s concept + due reviews |
| Teacher brief | `src/engine/teacher.js` | Root gap per student, class counts, greedy buddy pairing, alerts |
| Teach Chotu | `src/chotu/` | Teacher-editable rubric. Offline keyword check (EN/Hinglish/HI) plus a Gemini persona when online |
| Simulation | `src/engine/sim.js`, `scripts/simulate.js` | Virtual students with hidden planted gaps |

## Fits Indian classrooms

- **Works offline after first load.** A service worker caches the app. Only AI Chotu needs internet.
- **Shared phones.** Each child has their own profile and PIN.
- **No device.** The teacher prints personalised worksheets, one per student, starting at that student’s own root gap.
- **Languages and boards.** English and Hindi throughout, with Hinglish accepted by Chotu. Concepts are mapped to NCERT chapters.

## Privacy

- Students are stored by first name and class only.
- Chotu’s AI call sends only the explanation text, with no name or ID.
- In production, data lives in Supabase with row-level security (see `schema.sql`), is encrypted in transit and at rest, and requires parental consent under India’s DPDP Act 2023.
- **Demo only:** a Gemini key in `.env` is visible in the browser. In production the AI call goes through the backend.

## Tech

- **App:** React 18 + Vite, plain CSS, no other runtime dependencies.
- **Data:** stored in the browser (localStorage) in the shape of `schema.sql`.
- **AI:** the Gemini REST API, with an offline fallback.
- **Planned production backend:** FastAPI + Supabase Postgres.
