import { useMemo, useRef, useState } from 'react';
import QuestionCard from '../components/QuestionCard.jsx';
import { NumberLine, Thread, MasteryBar } from '../components/Visuals.jsx';
import { CONCEPT_BY_ID } from '../data/concepts.js';
import { LESSONS, LESSON_STYLES } from '../data/lessons.js';
import { QUESTION_BY_ID } from '../data/questions.js';
import { RUBRICS } from '../chotu/rubrics.js';
import { recordAnswer, recordLesson } from '../engine/student.js';
import { startTrace, nextProbe, recordProbe, MAX_PROBES } from '../engine/trace.js';
import { pickQuestion, TARGET } from '../engine/selector.js';
import { t, tx, cls } from '../i18n.js';

/**
 * The Learn loop for one question:
 * question → (wrong) Root-Cause Trace → root found → 2-minute lesson →
 * check the root → climb back up → retry the original question → summary.
 *
 * If `wrongOption` is given, the student already got `questionId` wrong
 * elsewhere (e.g. in practice) and we go straight to the trace.
 */
// Concepts to re-check on the way back up (a follow-up trace adds the old root).
const climbList = (tr) => [...(tr?.climb || []), ...(tr?.extraClimb || [])];

export default function LearnSession({ studentId, questionId, wrongOption, lang, store, onExit, onTeach }) {
  const { state, update } = store;
  const student = state.students[studentId];
  const startQ = QUESTION_BY_ID[questionId];
  const before = useRef(Object.fromEntries(Object.entries(student.mastery).map(([k, v]) => [k, v.p])));

  const [phase, setPhase] = useState(wrongOption ? 'trace-intro' : 'start');
  const [trace, setTrace] = useState(() => (wrongOption ? startTrace(student, startQ, wrongOption) : null));
  const [probeQ, setProbeQ] = useState(null);
  const [styleIdx, setStyleIdx] = useState(0);
  const [stylesTried, setStylesTried] = useState(1);
  const [checkQ, setCheckQ] = useState(null);
  const [climbIdx, setClimbIdx] = useState(0);
  const [climbQ, setClimbQ] = useState(null);
  const [message, setMessage] = useState(null);
  const [traceHistory, setTraceHistory] = useState([]); // earlier traces (follow-up goes deeper)
  const [result, setResult] = useState(null);
  const last = useRef(null);
  const [cardKey, setCardKey] = useState(0);

  const record = (q, opt, hints, mode) =>
    update((s) => {
      recordAnswer(s.students[studentId], s.qstats, q.id, opt.id, { hintsUsed: hints, mode });
      return s.students[studentId];
    });

  const fresh = () => state.students[studentId];
  const bump = () => setCardKey((k) => k + 1);

  // ── phase handlers ──
  const onStartAnswer = (opt, hints) => {
    const s = record(startQ, opt, hints, 'learn');
    last.current = { opt, s };
  };
  const onStartContinue = () => {
    const { opt, s } = last.current;
    if (opt.correct) { setResult({ fixed: false, alreadyFine: true }); setPhase('summary'); return; }
    setTrace(startTrace(s, startQ, opt));
    setPhase('trace-intro');
  };

  const beginProbes = (tr, s) => {
    const copy = structuredClone(tr);
    const q = nextProbe(s, copy);
    setTrace(copy);
    if (q) { setProbeQ(q); bump(); setPhase('probe'); } else setPhase('root');
  };

  const onProbeAnswer = (opt) => {
    const s = record(probeQ, opt, 0, 'probe');
    last.current = { opt, s };
  };
  const onProbeContinue = () => {
    const { opt, s } = last.current;
    const copy = structuredClone(trace);
    recordProbe(s, copy, probeQ, opt);
    const q = nextProbe(s, copy);
    setTrace(copy);
    if (q) { setProbeQ(q); bump(); } else setPhase('root');
  };

  const startLesson = () => {
    update((s) => recordLesson(s.students[studentId], trace.root));
    setPhase('lesson');
  };

  const toCheck = () => {
    const s = fresh();
    const used = [startQ.id, ...trace.probes.map((p) => p.q)];
    setCheckQ(pickQuestion(s, state.qstats, trace.root, { exclude: used, target: TARGET.easier }));
    setMessage(null);
    bump();
    setPhase('check');
  };
  const onCheckAnswer = (opt, hints) => {
    const s = record(checkQ, opt, hints, 'check');
    last.current = { opt, s };
  };
  const onCheckContinue = () => {
    const { opt, s } = last.current;
    if (opt.correct) {
      if (climbList(trace).length) { goClimb(0, s); } else { goRetry(); }
      return;
    }
    // Still wrong. Respect the max 3-probe diagnostic boundary and do not trap
    // the student in a chained 3-probe loop in the same sitting.
    // Try an alternate lesson explanation style, or record partial progress for teacher follow-up.
    if (stylesTried < LESSON_STYLES.length) {
      setStyleIdx((i) => (i + 1) % LESSON_STYLES.length);
      setStylesTried((n) => n + 1);
      setMessage(t(lang, 'newStyle'));
      update((st) => recordLesson(st.students[studentId], trace.root));
      setPhase('lesson');
    } else {
      setResult({ fixed: false });
      finishSession(false);
    }
  };

  const goClimb = (i, s) => {
    setClimbIdx(i);
    setClimbQ(pickQuestion(s, state.qstats, climbList(trace)[i], { exclude: trace.probes.map((p) => p.q), target: TARGET.normal }));
    bump();
    setPhase('climb');
  };
  const onClimbAnswer = (opt, hints) => { last.current = { opt, s: record(climbQ, opt, hints, 'climb') }; };
  const onClimbContinue = () => {
    const { opt, s } = last.current;
    if (!opt?.correct) {
      // Failed intermediate prerequisite climb question; do not falsely declare thread repaired
      setResult({ fixed: false });
      finishSession(false);
      return;
    }
    if (climbIdx + 1 < climbList(trace).length) goClimb(climbIdx + 1, s); else goRetry();
  };

  const goRetry = () => { bump(); setPhase('retry'); };
  const onRetryAnswer = (opt, hints) => { last.current = { opt, s: record(startQ, opt, hints, 'retry') }; };
  const onRetryContinue = () => finishSession(last.current.opt.correct);

  const finishSession = (fixed) => {
    update((s) => {
      s.students[studentId].rootsFixed.push({ root: trace.root, start: trace.start, fixed, probes: trace.probes.length, t: Date.now() });
    });
    setResult({ fixed });
    setPhase('summary');
  };

  // ── thread visual ──
  const threadNodes = useMemo(() => {
    if (!trace) return [];
    const all = [...traceHistory.flatMap((h) => h.probes), ...trace.probes];
    const nodes = [{ concept: trace.start, state: 'broken', note: lang === 'hi' ? 'यहाँ गलती हुई' : 'Mistake showed up here' }];
    for (const p of all) {
      if (p.concept === trace.start) continue;
      nodes.push({ concept: p.concept, state: p.correct ? 'intact' : 'broken', note: p.correct ? `✓ ${t(lang, 'checkPassed')}` : `✗ ${t(lang, 'checkMissed')}` });
    }
    if (trace.done) {
      const rootNode = [...nodes].reverse().find((n) => n.concept === trace.root);
      if (rootNode) { rootNode.state = 'root'; rootNode.note = lang === 'hi' ? 'जड़' : 'Root'; }
    }
    return nodes;
  }, [trace, traceHistory, lang]);

  const rootName = trace?.root && CONCEPT_BY_ID[trace.root] ? tx(CONCEPT_BY_ID[trace.root].name, lang) : '';
  const lesson = trace?.root && LESSONS[trace.root] ? LESSONS[trace.root] : null;
  const style = LESSON_STYLES[styleIdx];

  return (
    <div className="session">
      <button className="link back" onClick={onExit}>← {t(lang, 'home')}</button>

      {phase === 'start' && (
        <QuestionCard key={cardKey} question={startQ} lang={lang} seedKey={`${studentId}:${startQ.id}`}
          label={`${t(lang, 'demoQuestion')} · ${cls(lang, CONCEPT_BY_ID[startQ.concept].grade)}`}
          onAnswer={onStartAnswer} onContinue={onStartContinue} hints={false} />
      )}

      {phase === 'trace-intro' && (
        <div className="card">
          <p className="eyebrow">Root-Cause Trace</p>
          <h2>{t(lang, 'traceTitle')}</h2>
          <p>{t(lang, 'traceIntro')}</p>
          <Thread nodes={threadNodes} lang={lang} />
          <button className="btn primary" onClick={() => beginProbes(trace, fresh())}>{t(lang, 'continue')} →</button>
        </div>
      )}

      {phase === 'probe' && probeQ && (
        <div className="split">
          <div>
            {message && <p className="notice">{message}</p>}
            <QuestionCard key={cardKey} question={probeQ} lang={lang} hints={false} seedKey={`${studentId}:${probeQ.id}`}
              label={`${t(lang, 'probe')} ${trace.probes.length + 1} ${t(lang, 'of')} ${MAX_PROBES} · ${cls(lang, CONCEPT_BY_ID[probeQ.concept].grade)}`}
              onAnswer={onProbeAnswer} onContinue={onProbeContinue} />
          </div>
          <div className="card side"><p className="eyebrow">{t(lang, 'yourThread')}</p><Thread nodes={threadNodes} lang={lang} /></div>
        </div>
      )}

      {phase === 'root' && (
        <div className="card">
          <p className="eyebrow">Root-Cause Trace</p>
          <h2>{trace.root !== trace.start ? `🎯 ${t(lang, 'rootFound')}` : t(lang, 'rootFound')}</h2>
          <p className="big-root">{rootName} {trace?.root && CONCEPT_BY_ID[trace.root] ? <span className="pill">{cls(lang, CONCEPT_BY_ID[trace.root].grade)}</span> : null}</p>
          <p>{trace.root !== trace.start ? t(lang, 'rootFoundDesc') : t(lang, 'rootIsHere')}</p>
          <Thread nodes={threadNodes} lang={lang} />
          <button className="btn primary" onClick={startLesson}>{t(lang, 'startLesson')} →</button>
        </div>
      )}

      {phase === 'lesson' && lesson && (
        <div className="card lesson">
          <p className="eyebrow">{t(lang, 'lesson')} · {rootName}</p>
          {message && <p className="notice">{message}</p>}
          <div className="tabs small">
            {LESSON_STYLES.map((st, i) => (
              <button key={st} className={i === styleIdx ? 'on' : ''} onClick={() => setStyleIdx(i)}>
                {t(lang, `style${st[0].toUpperCase()}${st.slice(1)}`)}
              </button>
            ))}
          </div>
          {style === 'visual' && lesson.numberLine && <NumberLine points={[-3, 2]} lang={lang} />}
          <ol className="steps">
            {(lesson[style]?.[lang] || lesson[style]?.hinglish || lesson[style]?.en || lesson[style]?.hi || []).map((line, i) => <li key={i}>{line}</li>)}
          </ol>
          <div className="row">
            <button className="btn primary" onClick={toCheck}>{t(lang, 'gotItCheck')} →</button>
            <button className="btn" onClick={() => setStyleIdx((i) => (i + 1) % LESSON_STYLES.length)}>{t(lang, 'tryAnotherWay')}</button>
          </div>
        </div>
      )}

      {phase === 'check' && checkQ && (
        <QuestionCard key={cardKey} question={checkQ} lang={lang} label={`${t(lang, 'checkRoot')} · ${rootName}`}
          onAnswer={onCheckAnswer} onContinue={onCheckContinue} />
      )}

      {phase === 'climb' && climbQ && (
        <QuestionCard key={cardKey} question={climbQ} lang={lang}
          label={`${t(lang, 'climbing')} · ${cls(lang, CONCEPT_BY_ID[climbQ.concept].grade)} · ${tx(CONCEPT_BY_ID[climbQ.concept]?.name, lang)}`}
          onAnswer={onClimbAnswer} onContinue={onClimbContinue} />
      )}

      {phase === 'retry' && (
        <QuestionCard key={cardKey} question={startQ} lang={lang} label={`${t(lang, 'retryOriginal')} · ${cls(lang, CONCEPT_BY_ID[startQ.concept].grade)}`}
          onAnswer={onRetryAnswer} onContinue={onRetryContinue} />
      )}

      {phase === 'summary' && (
        <Summary result={result} trace={trace} before={before.current} student={state.students[studentId]} lang={lang} onExit={onExit} onTeach={onTeach} />
      )}
    </div>
  );
}

function Summary({ result, trace, before, student, lang, onExit, onTeach }) {
  if (result?.alreadyFine) {
    return (
      <div className="card">
        <h2>✓ {t(lang, 'correct')}</h2>
        <button className="btn primary" onClick={onExit}>{t(lang, 'home')}</button>
      </div>
    );
  }
  const concepts = [...new Set([trace?.root, ...climbList(trace), trace?.start])].filter((c) => c && CONCEPT_BY_ID[c]);
  return (
    <div className="card">
      <p className="eyebrow">{result?.fixed ? '🧵' : '📋'}</p>
      <h2>{result?.fixed ? t(lang, 'summaryTitle') : t(lang, 'summaryPartial')}</h2>
      <div className="table-scroll">
        <table className="mini">
          <tbody>
            {concepts.map((c) => (
              <tr key={c}>
                <td>{cls(lang, CONCEPT_BY_ID[c].grade)} · {tx(CONCEPT_BY_ID[c].name, lang)}</td>
                <td className="muted">{t(lang, 'before')} {Math.round((before?.[c] ?? 0.3) * 100)}%</td>
                <td><MasteryBar p={student?.mastery?.[c]?.p ?? 0.3} lang={lang} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">✉️ {t(lang, 'sentToTeacher')}</p>
      <div className="row">
        {trace?.root && RUBRICS[trace.root] && <button className="btn primary" onClick={() => onTeach(trace.root)}>🧒 {t(lang, 'teachItNow')}</button>}
        <button className="btn" onClick={onExit}>{t(lang, 'home')}</button>
      </div>
    </div>
  );
}
