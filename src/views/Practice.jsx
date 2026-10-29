import { useState } from 'react';
import QuestionCard from '../components/QuestionCard.jsx';
import { MasteryBar } from '../components/Visuals.jsx';
import { CONCEPT_BY_ID } from '../data/concepts.js';
import { MISCONCEPTIONS } from '../data/misconceptions.js';
import { recordAnswer, qStat } from '../engine/student.js';
import { confidence } from '../engine/elo.js';
import { nextConcept, pickQuestion, currentTarget, successChance, easierTwin, warmUp } from '../engine/selector.js';
import { t, cls } from '../i18n.js';

/**
 * Warm-up (3 questions) and adaptive practice.
 * A wrong answer that points to an earlier concept hands over to the
 * Root-Cause Trace (onTrace).
 */
export default function Practice({ studentId, mode, lang, store, onExit, onTrace }) {
  const { state, update } = store;
  const [queue, setQueue] = useState(() => (mode === 'warmup' ? warmUp(state.students[studentId], state.qstats, state.classFocus) : null));
  const [idx, setIdx] = useState(0);
  const [current, setCurrent] = useState(() => (queue ? makeItem(queue.questions[0], state, studentId, queue) : nextItem(state, studentId)));
  const [answered, setAnswered] = useState(null);
  const [misses, setMisses] = useState({});
  const [count, setCount] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [key, setKey] = useState(0);
  const [warmDone, setWarmDone] = useState(false);

  const student = state.students[studentId];

  const onAnswer = (opt, hints) => {
    update((s) => { recordAnswer(s.students[studentId], s.qstats, current.q.id, opt.id, { hintsUsed: hints, mode: mode === 'warmup' ? 'warmup' : 'practice' }); });
    setAnswered(opt);
    setCount((c) => c + 1);
    if (!opt.correct) setMisses((m) => ({ ...m, [current.q.concept]: (m[current.q.concept] || 0) + 1 }));
  };

  const onContinue = () => {
    const opt = answered;
    const c = CONCEPT_BY_ID[current.q.concept];
    // Hand over to the trace when the mistake points below this concept.
    if (!opt.correct && c.prereqs.length) {
      const m = opt.misconception ? MISCONCEPTIONS[opt.misconception] : null;
      const pointsDown = m && m.concept !== c.id;
      const repeated = (misses[c.id] || 0) >= 2;
      if (pointsDown || repeated) { onTrace(current.q.id, opt); return; }
    }
    setAnswered(null);
    setShowWhy(false);
    setKey((k) => k + 1);
    if (queue) {
      if (idx + 1 < queue.questions.length) {
        setIdx(idx + 1);
        setCurrent(makeItem(queue.questions[idx + 1], store.state, studentId, queue));
        return;
      }
      setQueue(null); // warm-up done → practice
      setWarmDone(true);
    }
    setCurrent(nextItem(store.state, studentId));
  };

  const onEasier = () => {
    const twin = easierTwin(state.students[studentId], state.qstats, current.q);
    if (twin) { setCurrent({ ...current, q: twin, easier: true }); setKey((k) => k + 1); }
  };

  const concept = CONCEPT_BY_ID[current.q.concept];
  const recent = student.attempts.filter((a) => a.mode === 'practice').slice(-5);
  const streak = (() => { let n = 0; for (let i = student.attempts.length - 1; i >= 0 && student.attempts[i].correct; i--) n++; return n; })();
  const label = queue
    ? `${t(lang, 'warmup')} ${idx + 1}/${queue.questions.length} · ${queue.review.includes(current.q.concept) ? t(lang, 'review') : t(lang, 'today')}`
    : `${t(lang, 'practice')} · ${cls(lang, concept.grade)} · ${concept.name[lang]}`;
  const aimText = { normal: 'aimNormal', harder: 'aimHarder', easier: 'aimEasier' }[current.target.key];

  return (
    <div className="session">
      <button className="link back" onClick={onExit}>← {t(lang, 'home')}</button>
      {warmDone && count <= 4 && <p className="notice">{t(lang, 'warmupDone')}</p>}
      <div className="split">
        <QuestionCard key={key} question={current.q} lang={lang} label={label} onAnswer={onAnswer} onContinue={onContinue} onEasier={onEasier} />
        <div className="card side">
          <p className="eyebrow">{concept.name[lang]}</p>
          <MasteryBar p={student.mastery[concept.id].p} lang={lang} />
          <div className="stats">
            <span>🔥 {t(lang, 'streak')}: <b>{streak}</b></span>
            <span>{recent.map((a, i) => <span key={i} className={a.correct ? 'dot good' : 'dot bad'} aria-label={a.correct ? 'right' : 'wrong'}>{a.correct ? '✓' : '✗'}</span>)}</span>
          </div>
          {!queue && (
            <p className={`aim ${current.target.key}`}>
              {current.target.key === 'harder' ? '⬆ ' : current.target.key === 'easier' ? '⬇ ' : '• '}{t(lang, aimText)}
            </p>
          )}
          <button className="link" onClick={() => setShowWhy((v) => !v)}>{t(lang, 'whyThis')}</button>
          {showWhy && (
            <ul className="why">
              <li>{t(lang, 'chance')}: <b>{Math.round(current.chance * 100)}%</b></li>
              <li>BKT P(known): {Math.round(current.p * 100)}%</li>
              <li>Elo: student {Math.round(current.rating)} vs question {Math.round(current.qRating)} ({current.qN} attempts, trust {Math.round(current.trust * 100)}%)</li>
              <li>{(student.focus || state.classFocus) === current.q.concept ? `🧑‍🏫 ${t(lang, 'teacherSet')}` : (lang === 'hi' ? 'सबसे कमज़ोर विषय जिसकी नींव पक्की है' : 'Weakest concept whose prerequisites are mastered')}</li>
              {current.easier && <li>{t(lang, 'hint3')}</li>}
            </ul>
          )}
          <button className="btn small" onClick={onExit}>{t(lang, 'endPractice')}</button>
        </div>
      </div>
    </div>
  );
}

function makeItem(q, state, studentId, queue, target) {
  const s = state.students[studentId];
  const stat = qStat(structuredClone(state.qstats), q);
  return {
    q,
    target: target || currentTarget(s),
    chance: successChance(s, structuredClone(state.qstats), q),
    p: s.mastery[q.concept].p,
    rating: s.rating,
    qRating: stat.rating,
    qN: stat.n,
    trust: confidence(stat.n),
    warm: !!queue,
  };
}

function nextItem(state, studentId) {
  const s = state.students[studentId];
  const c = nextConcept(s, state.classFocus);
  const target = currentTarget(s);
  const q = pickQuestion(s, structuredClone(state.qstats), c, { target: target.p });
  return makeItem(q, state, studentId, null, target);
}
