import { useState } from 'react';
import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { MasteryBar } from '../components/Visuals.jsx';
import { band } from '../engine/bkt.js';
import { nextConcept } from '../engine/selector.js';
import LearnSession from './LearnSession.jsx';
import Practice from './Practice.jsx';
import ChotuChat from './ChotuChat.jsx';
import { t, cls, tx } from '../i18n.js';

const DEMO_STUDENTS = [
  { id: 'riya', emoji: '👧', desc: 'riyaDesc' },
  { id: 'kabir', emoji: '👦', desc: 'kabirDesc' },
];

/** Student side: profile picker (shared phone + PIN) → dashboard → activities. */
export default function StudentApp({ lang, store, studentId, setStudentId, initialView }) {
  const [view, setView] = useState(() => {
    if (initialView === 'practice' || initialView === 'warmup' || initialView === 'chotu') return { name: initialView };
    if (initialView === 'learn') return { name: 'learn', questionId: 'c9_lin2_1', k: 1 };
    return { name: 'dash' };
  });
  if (!studentId) return <Picker lang={lang} onPick={setStudentId} store={store} />;

  const go = (name, extra = {}) => setView({ name, ...extra });
  const home = () => go('dash');

  if (view.name === 'learn') {
    return <LearnSession key={view.k} studentId={studentId} questionId={view.questionId} wrongOption={view.wrongOption} lang={lang} store={store}
      onExit={home} onTeach={(c) => go('chotu', { concept: c })} />;
  }
  if (view.name === 'practice' || view.name === 'warmup') {
    return <Practice key={view.name} studentId={studentId} mode={view.name} lang={lang} store={store} onExit={home}
      onTrace={(questionId, wrongOption) => go('learn', { questionId, wrongOption, k: Date.now() })} />;
  }
  if (view.name === 'chotu') {
    return <ChotuChat studentId={studentId} lang={lang} store={store} initialConcept={view.concept} onExit={home} />;
  }
  return <Dashboard lang={lang} store={store} studentId={studentId} go={go} onSwitch={() => setStudentId(null)} />;
}

function Picker({ lang, onPick }) {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="card narrow">
      <h2>{t(lang, 'whoAreYou')}</h2>
      <p className="muted">📱 {t(lang, 'sharedPhone')}</p>
      <div className="profiles">
        {DEMO_STUDENTS.map((s) => (
          <button key={s.id} className={`profile ${sel === s.id ? 'on' : ''}`} onClick={() => { setSel(s.id); setPin(''); setErr(false); }}>
            <span className="avatar big">{s.emoji}</span>
            <b>{s.id === 'riya' ? 'Riya' : 'Kabir'}</b>
            <span className="muted small">{t(lang, s.desc)}</span>
          </button>
        ))}
      </div>
      {sel && (
        <form className="pin" onSubmit={(e) => { e.preventDefault(); if (pin === '1234') onPick(sel); else setErr(true); }}>
          <label>{t(lang, 'enterPin')}
            <input inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus />
          </label>
          <button className="btn primary" type="submit">{t(lang, 'open')}</button>
          <p className="muted small">{err ? `⚠ ${t(lang, 'wrongPin')}` : t(lang, 'demoPin')}</p>
        </form>
      )}
    </div>
  );
}

function Dashboard({ lang, store, studentId, go, onSwitch }) {
  const { state } = store;
  const s = state.students[studentId];
  const focus = nextConcept(s, state.classFocus);
  const teacherSet = !!(s.focus || (state.classFocus && focus === state.classFocus));

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <p className="eyebrow">{t(lang, 'hello')}, {s.name} · {cls(lang, s.grade)}</p>
          <h1>{t(lang, 'todayPlan')}</h1>
        </div>
        <button className="link" onClick={onSwitch}>{t(lang, 'switchStudent')}</button>
      </div>

      <div className="focus card accent-card">
        <p className="eyebrow">{t(lang, 'todayFocus')}{teacherSet && <> · 🧑‍🏫 {t(lang, 'teacherSet')}</>}</p>
        <h2>{tx(CONCEPT_BY_ID[focus].name, lang)} <span className="pill">{cls(lang, CONCEPT_BY_ID[focus].grade)}</span></h2>
        <MasteryBar p={s.mastery[focus].p} lang={lang} />
      </div>

      <div className="actions">
        {studentId === 'riya' && (
          <button className="action highlight" onClick={() => go('learn', { questionId: 'c9_lin2_1', k: Date.now() })}>
            <span className="icon">🧵</span><b>{t(lang, 'demoQuestion')}</b><span className="muted small">{t(lang, 'demoQuestionDesc')}</span>
          </button>
        )}
        <button className="action" onClick={() => go('warmup')}>
          <span className="icon">☀️</span><b>{t(lang, 'warmup')}</b><span className="muted small">{t(lang, 'warmupDesc')}</span>
        </button>
        <button className="action" onClick={() => go('practice')}>
          <span className="icon">🎯</span><b>{t(lang, 'practice')}</b><span className="muted small">{t(lang, 'practiceDesc')}</span>
        </button>
        <button className="action" onClick={() => go('chotu')}>
          <span className="icon">🧒</span><b>{t(lang, 'teachChotu')}</b><span className="muted small">{t(lang, 'teachChotuDesc')}</span>
        </button>
      </div>

      <div className="card">
        <p className="eyebrow">{t(lang, 'yourThread')}</p>
        <p className="muted small">{t(lang, 'threadDesc')}</p>
        <div className="grade-grid">
          {[9, 8, 7, 6].map((g) => (
            <div key={g} className="grade-row">
              <span className="grade-label">{cls(lang, g)}</span>
              <div className="chips">
                {CONCEPTS.filter((c) => c.grade === g).map((c) => {
                  const b = band(s.mastery[c.id].p);
                  return (
                    <span key={c.id} className={`chip ${b}`} title={`${Math.round(s.mastery[c.id].p * 100)}%`}>
                      {tx(c.name, lang)} <b>{Math.round(s.mastery[c.id].p * 100)}%</b>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="legend">
          <span className="chip mastered">{t(lang, 'mastered')} ≥85%</span>
          <span className="chip ok">{t(lang, 'ok')}</span>
          <span className="chip shaky">{t(lang, 'shaky')}</span>
          <span className="chip weak">{t(lang, 'weak')} &lt;40%</span>
        </p>
      </div>
    </div>
  );
}
