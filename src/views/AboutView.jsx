import results from '../data/validation-results.json';
import { CONCEPT_BY_ID } from '../data/concepts.js';
import { tx, cls } from '../i18n.js';

/** How it works: algorithms, validation results we actually ran, and the data model. */
export default function AboutView({ lang = 'en' }) {
  const tr = results.trace;
  return (
    <div className="about">
      <div className="dash-head"><div><p className="eyebrow">Sutra prototype</p><h1>How it works</h1></div></div>

      <div className="card">
        <h2>Validation we ran</h2>
        <p className="muted">
          {results.students} simulated students with a planted root gap (+{results.practiceStudents} for practice),
          {' '}{results.concepts} concepts, {results.questionBank} tagged questions. Re-run with <code>npm run simulate</code>.
          Simulated students test whether the algorithms behave as designed; they are not evidence of learning gains with real children — that is what the pilot is for.
        </p>
        <div className="kpis">
          <Kpi value={`${tr.newStudent.landedOnBrokenConcept}%`} label="of traces point to a concept the student truly lacks" />
          <Kpi value={`${tr.newStudent.rootAccuracy}%`} label={`find the exact planted root in one session (${tr.newStudent.avgProbes} probes avg.)`} />
          <Kpi value={`${tr.afterPlacement.rootAccuracyWithFollowUp}%`} label="exact root after a placement check + next-session follow-up" />
          <Kpi value={`${tr.newStudent.baselineOneStepBack}%`} label="baseline: “go back one chapter” · re-drilling the chapter finds 0%" />
        </div>
        <div className="kpis">
          <Kpi value={results.prediction.auc} label={`AUC predicting the next answer (${results.prediction.answers} answers)`} />
          <Kpi value={`${results.coldStart.oursBrier} vs ${results.coldStart.plainEloBrier}`} label="Brier score on a brand-new bank: ours vs plain Elo (lower is better)" />
          <Kpi value={`${results.targeting.actualSuccessRate}%`} label="real success rate in practice vs 70% target" />
        </div>
        <details>
          <summary>Exact-root accuracy by planted gap (new student)</summary>
          <ul>{Object.entries(tr.newStudent.byRoot).map(([c, v]) => <li key={c}>{cls(lang, CONCEPT_BY_ID[c].grade)} · {tx(CONCEPT_BY_ID[c].name, lang)}: {v}%</li>)}</ul>
          <p className="muted small">What this told us: roots with few misconception tags in Class 8–9 questions (letters for numbers, fractions) are found less often, so the next content step is more tagged questions on those paths. Success rate sits below target because each concept has only 5 questions to choose from.</p>
        </details>
      </div>

      <div className="card">
        <h2>Algorithms</h2>
        <table className="mini algo">
          <tbody>
            <tr><td><b>Concept graph (DAG)</b></td><td>12 NCERT concepts, Class 6–9, with prerequisite links. Finding a root = walking down the links.</td></tr>
            <tr><td><b>Misconception tags</b></td><td>Every wrong option names the misconception behind it, and where that misconception lives. That is how a Class 9 mistake can jump straight to Class 7.</td></tr>
            <tr><td><b>Root-Cause Trace</b></td><td>≤3 short probes down the graph; stops at the first intact link; skips mastered concepts; continues next session if probes run out.</td></tr>
            <tr><td><b>Bayesian Knowledge Tracing</b></td><td>P(known) per student per concept, allowing for guesses (20%) and slips (10%). Hints weaken the evidence of a correct answer.</td></tr>
            <tr><td><b>Elo difficulty + cold start</b></td><td>Questions start from grade + author level, use a decaying K-factor, are trusted by number of attempts, and fall back to BKT until trusted. Seeded from earlier attempts.</td></tr>
            <tr><td><b>Next-item selector</b></td><td>Weakest concept whose prerequisites are mastered (teacher override first); question aimed at ~70% success, 55% after a streak, 85% after two misses.</td></tr>
            <tr><td><b>Spaced review (Leitner)</b></td><td>Boxes 1–5 at 1, 3, 7, 14, 30 days. Warm-up mixes today’s topic with due reviews.</td></tr>
            <tr><td><b>Buddy pairing</b></td><td>Greedy match: strongest on a concept paired with most stuck on it.</td></tr>
            <tr><td><b>Teach Chotu</b></td><td>Fixed teacher-editable rubric. Keyword check works offline in English/Hinglish/Hindi; Gemini adds judgement and the persona when online. Never graded.</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Data model</h2>
        <p className="muted">Full SQL in <code>schema.sql</code>. The prototype keeps the same shape in the browser (works offline) — in production it syncs to Supabase Postgres with row-level security.</p>
        <pre className="schema">{`schools(id, name, board, language)
teachers(id, school_id, name)
classes(id, school_id, teacher_id, grade, section, focus_concept_id)
students(id, class_id, first_name, preferred_language, device_mode, pin_hash, elo_rating, focus_concept_id)
concepts(id, subject, grade, ncert_ref, name_en, name_hi)
concept_prereqs(concept_id → concepts, prereq_id → concepts)
misconceptions(id, concept_id, probe_concept_id, text_en, text_hi)
questions(id, concept_id, level, is_probe, text_en, text_hi, hint_*, step_*)
options(id, question_id, text, is_correct, misconception_id)
question_stats(question_id, elo_rating, n_attempts)
mastery(student_id, concept_id, p_known, n, n_correct, leitner_box, next_review)
attempts(id, student_id, question_id, option_id, correct, hints_used, mode, created_at)
traces(id, student_id, start_question_id, root_concept_id, probes jsonb, fixed)
teachbacks(id, student_id, concept_id, score, out_of, transcript jsonb, used_ai)
rubric_overrides(class_id, concept_id, disabled_ids[])`}</pre>
      </div>

      <div className="card">
        <h2>Privacy</h2>
        <ul>
          <li>First name and class only. No phone numbers, photos or addresses of students.</li>
          <li>Chotu’s AI call sends only the explanation text — no name or ID.</li>
          <li>Each child on a shared phone has their own profile and PIN.</li>
          <li>In production: Supabase row-level security (a teacher sees only their classes), encryption in transit and at rest, parental consent as required by India’s DPDP Act 2023.</li>
        </ul>
      </div>
    </div>
  );
}

function Kpi({ value, label }) {
  return <div className="kpi"><p className="kpi-value">{value}</p><p className="kpi-label">{label}</p></div>;
}
