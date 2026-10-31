import { useMemo, useState } from 'react';
import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { LESSONS } from '../data/lessons.js';
import { MISCONCEPTIONS } from '../data/misconceptions.js';
import { QUESTION_BY_ID, questionsFor } from '../data/questions.js';
import { RUBRICS } from '../chotu/rubrics.js';
import { band } from '../engine/bkt.js';
import { recordAnswer } from '../engine/student.js';
import { morningBrief, rootGap } from '../engine/teacher.js';
import { MasteryBar } from '../components/Visuals.jsx';
import { t, tx, cls } from '../i18n.js';

const SHORT = {
  c6_int: 'Neg. nos', c6_frac: 'Fractions', c6_var: 'Letters',
  c7_intops: 'Int ±', c7_intmul: 'Int ×÷', c7_fracops: 'Frac ops', c7_expr: 'Like terms', c7_simpleeq: 'Simple eq',
  c8_lineq: 'Lin. eq', c8_brackets: 'Brackets', c9_poly: 'Poly value', c9_lin2: '2-var eq',
};

/** Teacher dashboard: morning brief, class heatmap, student detail, worksheets, rubric. */
export default function TeacherView({ store, lang }) {
  const { state, update } = store;
  const students = useMemo(() => Object.values(state.students), [state.students]);
  const brief = useMemo(() => morningBrief(students, state.classFocus), [students, state.classFocus]);
  const [tab, setTab] = useState('brief');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);

  const approve = (concept) => update((s) => { s.classFocus = concept; s.briefApproved = true; });
  const clearFocus = () => update((s) => { s.classFocus = null; s.briefApproved = false; });

  const shareWhatsApp = () => {
    if (!brief.top) return;
    const topConcept = CONCEPT_BY_ID[brief.top];
    const topLesson = LESSONS[brief.top];
    const pairsText = brief.pairs.length > 0
      ? brief.pairs.slice(0, 4).map((p) => `• ${p.helper.name} ➔ ${p.learner.name}`).join('\n')
      : '• Self-paced micro-lessons assigned';

    const msg = [
      `*Kal ki Class Brief — Class 9B (Maths)*`,
      `📅 ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`,
      ``,
      `🎯 *Top Root Gap in Class:*`,
      `${tx(topConcept.name, lang)} (${cls(lang, topConcept.grade)}) — ${brief.topCount}/${brief.total} students stuck`,
      ``,
      `💡 *10-Min Re-teach Activity:*`,
      `${topLesson.reteach[lang] || topLesson.reteach.en}`,
      ``,
      `👥 *Buddy Pairs (Peer Helpers):*`,
      pairsText,
      ``,
      `_Sent via Sutra Adaptive Learning_`,
    ].filter(Boolean).join('\n');

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sel = selected ? state.students[selected] : null;

  return (
    <div className="teacher">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Class 9B · Maths · Mrs. Lakshmi</p>
          <h1>Kal ki Class</h1>
        </div>
        <div className="tabs">
          {[
            ['brief', t(lang, 'morningBrief')],
            ['heatmap', t(lang, 'classHeatmap')],
            ['sheets', t(lang, 'worksheets')],
            ['rubric', t(lang, 'chotuRubric')],
          ].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'brief' && (
        <div className="brief-grid">
          <div className="card brief">
            <p className="eyebrow">{t(lang, 'todayBrief')}</p>
            {brief.top ? (
              <>
                <h2>{brief.topCount} {t(lang, 'of')} {brief.total} {t(lang, 'studentsNeedsHelp') || 'students share one root gap'}: <span className="accent-text">{tx(CONCEPT_BY_ID[brief.top].name, lang)}</span> ({cls(lang, brief.grade)})</h2>
                <div className="brief-item">💡 <div><b>{t(lang, 'reteachActivity')}</b><p>{LESSONS[brief.top].reteach[lang] || LESSONS[brief.top].reteach.en}</p></div></div>
                <div className="brief-item">👥 <div><b>{brief.pairs.length} {t(lang, 'buddyPairsReady')}</b>
                  <p>{brief.pairs.length > 0 ? (
                    <>
                      {brief.pairs.slice(0, 4).map((p) => `${p.helper.name} helps ${p.learner.name}`).join(' · ')}
                      {brief.pairs.length > 4 ? ` · +${brief.pairs.length - 4} more` : ''}
                    </>
                  ) : (t(lang, 'noBuddyPairs'))}</p></div></div>
                <div className="brief-item">🖨️ <div><b>{t(lang, 'personalisedWorksheets')}</b><p>{t(lang, 'worksheetDesc')} <button className="link" onClick={() => setTab('sheets')}>{t(lang, 'open')}</button></p></div></div>
                {state.classFocus ? (
                  <div className="approved">
                    <div>
                      ✓ {t(lang, 'planApproved')} <b>{tx(CONCEPT_BY_ID[state.classFocus].name, lang)}</b> {t(lang, 'first')}
                      <button className="link" onClick={clearFocus}>{t(lang, 'undo')}</button>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <button className="btn wa" onClick={shareWhatsApp}>📲 {t(lang, 'shareWhatsApp')}</button>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <button className="btn primary" onClick={() => approve(brief.top)}>{t(lang, 'approvePlan')}</button>
                    <button className="btn" onClick={() => setEditing((v) => !v)}>{t(lang, 'edit')}</button>
                    <button className="btn wa" onClick={shareWhatsApp}>📲 {t(lang, 'shareWhatsApp')}</button>
                  </div>
                )}
                {editing && !state.classFocus && (
                  <label className="edit">{t(lang, 'makeClassFocus')}
                    <select defaultValue={brief.top} onChange={(e) => { approve(e.target.value); setEditing(false); }}>
                      {CONCEPTS.map((c) => <option key={c.id} value={c.id}>{cls(lang, c.grade)} · {tx(c.name, lang)}</option>)}
                    </select>
                  </label>
                )}
              </>
            ) : <h2>{t(lang, 'noSharedGap')}</h2>}
          </div>

          <div className="card">
            <p className="eyebrow">{t(lang, 'otherRootGaps')}</p>
            <ul className="bars">
              {brief.counts.map(([c, n]) => (
                <li key={c}><span>{cls(lang, CONCEPT_BY_ID[c].grade)} · {tx(CONCEPT_BY_ID[c].name, lang)}</span>
                  <span className="hbar"><span style={{ width: `${brief.total > 0 ? (n / brief.total) * 100 * 2.5 : 0}%` }} /></span><b>{n}</b></li>
              ))}
            </ul>
            <p className="eyebrow" style={{ marginTop: 20 }}>{t(lang, 'needsAttention')}</p>
            <ul className="alerts">
              {brief.alerts.slice(0, 6).map((a) => (
                <li key={a.student.id}><button className="link" onClick={() => { setSelected(a.student.id); setTab('heatmap'); }}>{a.student.name}</button>
                  <span className="muted"> — {a.kind === 'idle' ? `${t(lang, 'noPracticeDays')} ${a.days} ${t(lang, 'days')}` : `${a.count} ${t(lang, 'weakConcepts')}`}</span></li>
              ))}
            </ul>
            <LiveRiya state={state} onOpen={() => { setSelected('riya'); setTab('heatmap'); }} lang={lang} />
          </div>
        </div>
      )}

      {tab === 'heatmap' && (
        <div className={`heat-wrap ${sel ? 'with-detail' : ''}`}>
          <div className="card heat-card">
            <p className="eyebrow">{t(lang, 'masteryByConcept')}</p>
            <div className="heat-scroll">
              <table className="heat">
                <thead>
                  <tr><th>{t(lang, 'studentHeader')}</th><th>{t(lang, 'rootGapHeader')}</th>{CONCEPTS.map((c) => <th key={c.id} title={tx(c.name, lang)}><span>C{c.grade}</span>{SHORT[c.id]}</th>)}</tr>
                </thead>
                <tbody>
                  {[...students].sort((a, b) => (rootGap(a) || 'z').localeCompare(rootGap(b) || 'z') || a.name.localeCompare(b.name)).map((s) => {
                    const r = rootGap(s);
                    return (
                      <tr key={s.id} className={selected === s.id ? 'sel' : ''} onClick={() => setSelected(s.id)}>
                        <td className="name">{s.name}{s.id === 'riya' && ' ●'}</td>
                        <td className="muted">{r ? SHORT[r] : '—'}</td>
                        {CONCEPTS.map((c) => {
                          const p = s.mastery[c.id].p;
                          return <td key={c.id} className={`cell ${band(p)}`}>{Math.round(p * 100)}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="legend"><span className="chip mastered">≥85 {t(lang, 'mastered')}</span><span className="chip ok">60–84</span><span className="chip shaky">40–59 {t(lang, 'shaky')}</span><span className="chip weak">&lt;40 {t(lang, 'weak')}</span></p>
          </div>
          {sel && <StudentDetail s={sel} update={update} onClose={() => setSelected(null)} lang={lang} />}
        </div>
      )}

      {tab === 'sheets' && <Worksheets students={students} update={update} lang={lang} />}
      {tab === 'rubric' && <RubricView state={state} update={update} lang={lang} />}
    </div>
  );
}

function LiveRiya({ state, onOpen, lang }) {
  const r = state.students?.riya;
  if (!r) return null;
  const last = r.rootsFixed?.[r.rootsFixed.length - 1];
  const rootConcept = last?.root ? CONCEPT_BY_ID[last.root] : null;
  const startConcept = last?.start ? CONCEPT_BY_ID[last.start] : null;
  return (
    <div className="live">
      <p className="eyebrow">Live · {r.name || 'Riya'}</p>
      {last && rootConcept && startConcept ? (
        <p>Root traced to <b>{tx(rootConcept.name, lang)}</b> ({cls(lang, rootConcept.grade)}) from a {cls(lang, startConcept.grade)} question in {last.probes} probes — {last.fixed ? 'fixed ✓' : 'still working on it'}.</p>
      ) : <p className="muted">No session yet today.</p>}
      {r.teachbacks?.length > 0 && <p>Taught Chotu: {r.teachbacks[r.teachbacks.length - 1].score}/{r.teachbacks[r.teachbacks.length - 1].outOf} key ideas.</p>}
      <button className="link" onClick={onOpen}>Open {r.name || 'Riya'} →</button>
    </div>
  );
}

function StudentDetail({ s, update, onClose, lang }) {
  const r = rootGap(s);
  const recent = [...s.attempts].reverse().filter((a) => a.mode !== 'seed').slice(0, 8);
  const misconceptions = {};
  for (const a of s.attempts) if (a.misconception) misconceptions[a.misconception] = (misconceptions[a.misconception] || 0) + 1;
  const topMis = Object.entries(misconceptions).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <div className="card detail">
      <div className="row between"><h2>{s.name}</h2><button className="link" onClick={onClose}>Close ✕</button></div>
      <p>Root gap: <b>{r && CONCEPT_BY_ID[r] ? `${cls(lang, CONCEPT_BY_ID[r].grade)} · ${tx(CONCEPT_BY_ID[r].name, lang)}` : 'none'}</b></p>
      <label className="edit">Override this student’s focus:
        <select value={s.focus || ''} onChange={(e) => update((st) => { st.students[s.id].focus = e.target.value || null; })}>
          <option value="">Let Sutra decide</option>
          {CONCEPTS.map((c) => <option key={c.id} value={c.id}>{cls(lang, c.grade)} · {tx(c.name, lang)}</option>)}
        </select>
      </label>
      <p className="eyebrow">{t(lang, 'mastery')}</p>
      <ul className="mastery-list">
        {CONCEPTS.map((c) => <li key={c.id}><span>C{c.grade} {SHORT[c.id]}</span><MasteryBar p={s.mastery[c.id].p} lang={lang} /></li>)}
      </ul>
      {topMis.length > 0 && <>
        <p className="eyebrow">Most frequent misconceptions</p>
        <ul>{topMis.map(([m, n]) => <li key={m}>{MISCONCEPTIONS[m]?.text ? tx(MISCONCEPTIONS[m].text, lang) : m} <span className="muted">×{n}</span></li>)}</ul>
      </>}
      {recent.length > 0 && <>
        <p className="eyebrow">Recent answers</p>
        <ul className="recent">
          {recent.map((a, i) => (
            <li key={a.t || `${a.q}-${i}`}>{a.correct ? '✓' : '✗'} {tx(QUESTION_BY_ID[a.q]?.text, lang)} <span className="muted">· {a.mode}{a.hintsUsed ? ` · ${a.hintsUsed} hint` : ''}</span></li>
          ))}
        </ul>
      </>}
      {s.teachbacks?.length > 0 && <>
        <p className="eyebrow">Teach Chotu transcripts</p>
        {s.teachbacks.slice(-2).map((tb, i) => (
          <details key={tb.t || i}>
            <summary>{CONCEPT_BY_ID[tb.concept] ? tx(CONCEPT_BY_ID[tb.concept].name, lang) : tb.concept}: {tb.score}/{tb.outOf} ideas {tb.ai ? '(AI)' : '(offline)'}</summary>
            {tb.transcript.map((m, j) => <p key={`${m.from}-${j}`} className={`bubble ${m.from} small`}>{m.text}</p>)}
          </details>
        ))}
      </>}
    </div>
  );
}

function Worksheets({ students, update, lang }) {
  const [mode, setMode] = useState('grid');
  const [graded, setGraded] = useState({});

  const sheets = useMemo(() => {
    return students
      .map((s) => ({ s, root: rootGap(s) }))
      .filter((x) => x.root && CONCEPT_BY_ID[x.root])
      .map(({ s, root }) => {
        const qs = questionsFor(root).sort((a, b) => a.level - b.level).slice(0, 4);
        const above = CONCEPTS.find((c) => c.prereqs.includes(root));
        const extra = above ? questionsFor(above.id).sort((a, b) => a.level - b.level)[0] : null;
        return { s, root, qs: extra ? [...qs, extra] : qs };
      });
  }, [students]);

  const gradeStudent = (studentId, score, qs) => {
    setGraded((prev) => ({ ...prev, [studentId]: score }));
    if (!update) return;
    update((state) => {
      const student = state.students[studentId];
      if (!student) return;
      qs.forEach((q, idx) => {
        const isCorrect = idx < score;
        const opt = isCorrect
          ? q.options.find((o) => o.correct)
          : q.options.find((o) => !o.correct);
        if (opt) {
          recordAnswer(student, state.qstats, q.id, opt.id, { mode: 'paper' });
        }
      });
    });
  };

  const prefillDemo = () => {
    const demoScores = [3, 4, 3, 2, 4, 3, 4, 4, 2, 3, 4, 3];
    sheets.forEach(({ s, qs }, idx) => {
      const sc = demoScores[idx % demoScores.length];
      gradeStudent(s.id, sc, qs);
    });
  };

  const gradedCount = Object.keys(graded).length;

  return (
    <div>
      <div className="card no-print" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div className="tabs small">
            <button className={mode === 'grid' ? 'on' : ''} onClick={() => setMode('grid')}>
              {t(lang, 'paperTapGrid')}
            </button>
            <button className={mode === 'print' ? 'on' : ''} onClick={() => setMode('print')}>
              {t(lang, 'printSheets')}
            </button>
          </div>
          {mode === 'grid' ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="chip ok">{t(lang, 'gradedStatus', { n: gradedCount, total: sheets.length })}</span>
              <button className="btn small" onClick={prefillDemo}>
                {t(lang, 'prefillDemo')}
              </button>
            </div>
          ) : (
            <button className="btn primary" onClick={() => window.print()}>
              🖨️ {t(lang, 'printAll')}
            </button>
          )}
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>
          {mode === 'grid'
            ? t(lang, 'tapGridDesc')
            : `${sheets.length} ${t(lang, 'worksheetDesc') || 'personalised sheets — each starts at the student’s own root gap.'}`}
        </p>
      </div>

      {mode === 'grid' ? (
        <div className="card">
          <div className="table-scroll">
            <table className="roster-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>{t(lang, 'student')}</th>
                  <th style={{ padding: '8px 12px' }}>{t(lang, 'todayFocus')}</th>
                  <th style={{ padding: '8px 12px' }}>{t(lang, 'score')} (/ 4)</th>
                  <th style={{ padding: '8px 12px' }}>{t(lang, 'mastery') || 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map(({ s, root, qs }) => {
                  const currentScore = graded[s.id];
                  const p = s.mastery[root]?.p || 0;
                  const b = band(p);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                        {s.name} <span className="muted small" style={{ fontWeight: 400 }}>· Cl {s.grade}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="accent-text" style={{ fontWeight: 600 }}>{tx(CONCEPT_BY_ID[root].name, lang)}</span>
                        <div className="muted small">({cls(lang, CONCEPT_BY_ID[root].grade)})</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          {[0, 1, 2, 3, 4].map((sc) => (
                            <button
                              key={sc}
                              type="button"
                              onClick={() => gradeStudent(s.id, sc, qs)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                border: '1px solid var(--line)',
                                background: currentScore === sc ? 'var(--accent)' : 'var(--paper)',
                                color: currentScore === sc ? '#fff' : 'var(--ink)',
                                fontWeight: currentScore === sc ? 800 : 600,
                                cursor: 'pointer',
                                minHeight: 36,
                                minWidth: 36,
                              }}
                            >
                              {sc}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`chip ${b}`}>
                          {Math.round(p * 100)}% {t(lang, b)}
                        </span>
                        {currentScore !== undefined && (
                          <span className="chip ok" style={{ marginLeft: 6 }}>
                            ✓ {currentScore}/4
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="sheets">
          {sheets.map(({ s, root, qs }) => (
            <div key={s.id} className="sheet">
              <p className="eyebrow">Sutra worksheet · Class 9B</p>
              <h3>{s.name}</h3>
              <p className="muted small">Focus: {tx(CONCEPT_BY_ID[root].name, lang)} ({cls(lang, CONCEPT_BY_ID[root].grade)})</p>
              <ol>
                {qs.map((q) => (
                  <li key={q.id}>{tx(q.text, s.lang || lang)}
                    <div className="opts">{q.options.map((o, i) => <span key={o.id}>{String.fromCharCode(65 + i)}) {tx(o.text, s.lang || lang)}</span>)}</div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RubricView({ state, update, lang }) {
  const toggle = (concept, id) => update((s) => {
    const cur = new Set(s.rubricEdits[concept] || []);
    cur.has(id) ? cur.delete(id) : cur.add(id);
    s.rubricEdits[concept] = [...cur];
  });
  return (
    <div className="rubrics">
      <p className="muted">Teach Chotu scores explanations against these key ideas. Untick an idea to leave it out for your class.</p>
      {Object.entries(RUBRICS).map(([c, r]) => (
        <div key={c} className="card">
          <p className="eyebrow">{CONCEPT_BY_ID[c] ? cls(lang, CONCEPT_BY_ID[c].grade) : ''}</p>
          <h3>{CONCEPT_BY_ID[c] ? tx(CONCEPT_BY_ID[c].name, lang) : c}</h3>
          <p className="muted small">Chotu opens with: “{tx(r.opener, lang)}”</p>
          <ul className="checklist">
            {r.ideas.map((i) => {
              const off = (state.rubricEdits[c] || []).includes(i.id);
              return (
                <li key={i.id} className={off ? '' : 'on'}>
                  <label><input type="checkbox" checked={!off} onChange={() => toggle(c, i.id)} /> {tx(i.label, lang)}</label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
