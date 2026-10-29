import { useMemo, useState } from 'react';
import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts.js';
import { LESSONS } from '../data/lessons.js';
import { MISCONCEPTIONS } from '../data/misconceptions.js';
import { QUESTION_BY_ID, questionsFor } from '../data/questions.js';
import { RUBRICS } from '../chotu/rubrics.js';
import { band } from '../engine/bkt.js';
import { morningBrief, rootGap } from '../engine/teacher.js';
import { MasteryBar } from '../components/Visuals.jsx';
import { tx } from '../i18n.js';

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

  const sel = selected ? state.students[selected] : null;

  return (
    <div className="teacher">
      <div className="dash-head">
        <div>
          <p className="eyebrow">Class 9B · Maths · Mrs. Lakshmi</p>
          <h1>Kal ki Class</h1>
        </div>
        <div className="tabs">
          {[['brief', 'Morning brief'], ['heatmap', 'Class heatmap'], ['sheets', 'Worksheets'], ['rubric', 'Chotu rubric']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'brief' && (
        <div className="brief-grid">
          <div className="card brief">
            <p className="eyebrow">Today · 2-minute brief</p>
            {brief.top ? (
              <>
                <h2>{brief.topCount} of {brief.total} students share one root gap: <span className="accent-text">{CONCEPT_BY_ID[brief.top].name.en}</span> (Class {brief.grade})</h2>
                <div className="brief-item">💡 <div><b>10-minute re-teach</b><p>{LESSONS[brief.top].reteach[lang] || LESSONS[brief.top].reteach.en}</p></div></div>
                <div className="brief-item">👥 <div><b>{brief.pairs.length} buddy pairs ready</b>
                  <p>{brief.pairs.slice(0, 4).map((p) => `${p.helper.name} helps ${p.learner.name}`).join(' · ')}{brief.pairs.length > 4 ? ` · +${brief.pairs.length - 4} more` : ''}</p></div></div>
                <div className="brief-item">🖨️ <div><b>Personalised worksheets</b><p>A different sheet for each student, built from their own root gap. <button className="link" onClick={() => setTab('sheets')}>Open →</button></p></div></div>
                {state.classFocus ? (
                  <div className="approved">
                    ✓ Plan approved: students practise <b>{CONCEPT_BY_ID[state.classFocus].name.en}</b> first.
                    <button className="link" onClick={clearFocus}>Undo</button>
                  </div>
                ) : (
                  <div className="row">
                    <button className="btn primary" onClick={() => approve(brief.top)}>Approve plan</button>
                    <button className="btn" onClick={() => setEditing((v) => !v)}>Edit</button>
                  </div>
                )}
                {editing && !state.classFocus && (
                  <label className="edit">Make today’s class focus:
                    <select defaultValue={brief.top} onChange={(e) => { approve(e.target.value); setEditing(false); }}>
                      {CONCEPTS.map((c) => <option key={c.id} value={c.id}>Class {c.grade} · {c.name.en}</option>)}
                    </select>
                  </label>
                )}
              </>
            ) : <h2>No shared root gap today 🎉</h2>}
          </div>

          <div className="card">
            <p className="eyebrow">Other root gaps</p>
            <ul className="bars">
              {brief.counts.map(([c, n]) => (
                <li key={c}><span>Class {CONCEPT_BY_ID[c].grade} · {CONCEPT_BY_ID[c].name.en}</span>
                  <span className="hbar"><span style={{ width: `${(n / brief.total) * 100 * 2.5}%` }} /></span><b>{n}</b></li>
              ))}
            </ul>
            <p className="eyebrow" style={{ marginTop: 20 }}>Needs attention</p>
            <ul className="alerts">
              {brief.alerts.slice(0, 6).map((a) => (
                <li key={a.student.id}><button className="link" onClick={() => { setSelected(a.student.id); setTab('heatmap'); }}>{a.student.name}</button>
                  <span className="muted"> — {a.kind === 'idle' ? `no practice for ${a.days} days` : `${a.count} weak concepts`}</span></li>
              ))}
            </ul>
            <LiveRiya state={state} onOpen={() => { setSelected('riya'); setTab('heatmap'); }} />
          </div>
        </div>
      )}

      {tab === 'heatmap' && (
        <div className={`heat-wrap ${sel ? 'with-detail' : ''}`}>
          <div className="card heat-card">
            <p className="eyebrow">Mastery by concept · click a student</p>
            <div className="heat-scroll">
              <table className="heat">
                <thead>
                  <tr><th>Student</th><th>Root gap</th>{CONCEPTS.map((c) => <th key={c.id} title={c.name.en}><span>C{c.grade}</span>{SHORT[c.id]}</th>)}</tr>
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
            <p className="legend"><span className="chip mastered">≥85 mastered</span><span className="chip ok">60–84</span><span className="chip shaky">40–59 shaky</span><span className="chip weak">&lt;40 gap</span></p>
          </div>
          {sel && <StudentDetail s={sel} update={update} onClose={() => setSelected(null)} lang={lang} />}
        </div>
      )}

      {tab === 'sheets' && <Worksheets students={students} />}
      {tab === 'rubric' && <RubricView state={state} update={update} />}
    </div>
  );
}

function LiveRiya({ state, onOpen }) {
  const r = state.students.riya;
  const last = r.rootsFixed[r.rootsFixed.length - 1];
  return (
    <div className="live">
      <p className="eyebrow">Live · Riya</p>
      {last ? (
        <p>Root traced to <b>{CONCEPT_BY_ID[last.root].name.en}</b> (Class {CONCEPT_BY_ID[last.root].grade}) from a Class {CONCEPT_BY_ID[last.start].grade} question in {last.probes} probes — {last.fixed ? 'fixed ✓' : 'still working on it'}.</p>
      ) : <p className="muted">No session yet today.</p>}
      {r.teachbacks.length > 0 && <p>Taught Chotu: {r.teachbacks[r.teachbacks.length - 1].score}/{r.teachbacks[r.teachbacks.length - 1].outOf} key ideas.</p>}
      <button className="link" onClick={onOpen}>Open Riya →</button>
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
      <p>Root gap: <b>{r ? `Class ${CONCEPT_BY_ID[r].grade} · ${CONCEPT_BY_ID[r].name.en}` : 'none'}</b></p>
      <label className="edit">Override this student’s focus:
        <select value={s.focus || ''} onChange={(e) => update((st) => { st.students[s.id].focus = e.target.value || null; })}>
          <option value="">Let Sutra decide</option>
          {CONCEPTS.map((c) => <option key={c.id} value={c.id}>Class {c.grade} · {c.name.en}</option>)}
        </select>
      </label>
      <p className="eyebrow">Mastery</p>
      <ul className="mastery-list">
        {CONCEPTS.map((c) => <li key={c.id}><span>C{c.grade} {SHORT[c.id]}</span><MasteryBar p={s.mastery[c.id].p} lang="en" /></li>)}
      </ul>
      {topMis.length > 0 && <>
        <p className="eyebrow">Most frequent misconceptions</p>
        <ul>{topMis.map(([m, n]) => <li key={m}>{MISCONCEPTIONS[m].text.en} <span className="muted">×{n}</span></li>)}</ul>
      </>}
      {recent.length > 0 && <>
        <p className="eyebrow">Recent answers</p>
        <ul className="recent">
          {recent.map((a, i) => (
            <li key={i}>{a.correct ? '✓' : '✗'} {tx(QUESTION_BY_ID[a.q].text, 'en')} <span className="muted">· {a.mode}{a.hintsUsed ? ` · ${a.hintsUsed} hint` : ''}</span></li>
          ))}
        </ul>
      </>}
      {s.teachbacks.length > 0 && <>
        <p className="eyebrow">Teach Chotu transcripts</p>
        {s.teachbacks.slice(-2).map((tb, i) => (
          <details key={i}>
            <summary>{CONCEPT_BY_ID[tb.concept].name.en}: {tb.score}/{tb.outOf} ideas {tb.ai ? '(AI)' : '(offline)'}</summary>
            {tb.transcript.map((m, j) => <p key={j} className={`bubble ${m.from} small`}>{m.text}</p>)}
          </details>
        ))}
      </>}
    </div>
  );
}

function Worksheets({ students }) {
  const sheets = students
    .map((s) => ({ s, root: rootGap(s) }))
    .filter((x) => x.root)
    .map(({ s, root }) => {
      const qs = questionsFor(root).sort((a, b) => a.level - b.level).slice(0, 4);
      const above = CONCEPTS.find((c) => c.prereqs.includes(root));
      const extra = above ? questionsFor(above.id).sort((a, b) => a.level - b.level)[0] : null;
      return { s, root, qs: extra ? [...qs, extra] : qs };
    });
  return (
    <div>
      <div className="row no-print">
        <p className="muted">{sheets.length} personalised sheets — each starts at the student’s own root gap. No device needed.</p>
        <button className="btn primary" onClick={() => window.print()}>🖨️ Print all</button>
      </div>
      <div className="sheets">
        {sheets.map(({ s, root, qs }) => (
          <div key={s.id} className="sheet">
            <p className="eyebrow">Sutra worksheet · Class 9B</p>
            <h3>{s.name}</h3>
            <p className="muted small">Focus: {CONCEPT_BY_ID[root].name.en} (Class {CONCEPT_BY_ID[root].grade})</p>
            <ol>
              {qs.map((q) => (
                <li key={q.id}>{tx(q.text, s.lang)}
                  <div className="opts">{q.options.map((o, i) => <span key={o.id}>{String.fromCharCode(65 + i)}) {tx(o.text, s.lang)}</span>)}</div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function RubricView({ state, update }) {
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
          <p className="eyebrow">Class {CONCEPT_BY_ID[c].grade}</p>
          <h3>{CONCEPT_BY_ID[c].name.en}</h3>
          <p className="muted small">Chotu opens with: “{r.opener.en}”</p>
          <ul className="checklist">
            {r.ideas.map((i) => {
              const off = (state.rubricEdits[c] || []).includes(i.id);
              return (
                <li key={i.id} className={off ? '' : 'on'}>
                  <label><input type="checkbox" checked={!off} onChange={() => toggle(c, i.id)} /> {i.label.en}</label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
