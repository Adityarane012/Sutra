import { useEffect, useRef, useState } from 'react';
import { CONCEPT_BY_ID } from '../data/concepts.js';
import { RUBRICS, CHOTU_CONCEPTS } from '../chotu/rubrics.js';
import { scriptedTurn, matchIdeas } from '../chotu/scripted.js';
import { geminiAvailable, geminiTurn } from '../chotu/gemini.js';
import { pKnown } from '../engine/student.js';
import { t, cls } from '../i18n.js';

const MAX_TURNS = 5;

/** Teach Chotu: the student explains, Chotu asks "but why?", a rubric scores it. */
export default function ChotuChat({ studentId, lang, store, initialConcept, onExit }) {
  const { state, update } = store;
  const student = state.students[studentId];
  const [concept, setConcept] = useState(initialConcept || null);

  if (!concept) {
    const fixed = new Set(student.rootsFixed.map((r) => r.root));
    const options = [...CHOTU_CONCEPTS].sort((a, b) => (fixed.has(b) - fixed.has(a)) || pKnown(student, b) - pKnown(student, a));
    return (
      <div className="session">
        <button className="link back" onClick={onExit}>← {t(lang, 'home')}</button>
        <div className="card">
          <h2>🧒 {t(lang, 'chotuPick')}</h2>
          <div className="pick-list">
            {options.map((c) => (
              <button key={c} className="option" onClick={() => setConcept(c)}>
                <b>{CONCEPT_BY_ID[c].name[lang]}</b> <span className="muted">· {cls(lang, CONCEPT_BY_ID[c].grade)}</span>
                {fixed.has(c) && <span className="pill accent">{t(lang, 'chotuRecommended')}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return <Chat key={concept} concept={concept} studentId={studentId} lang={lang} update={update} rubricEdits={state.rubricEdits} onExit={onExit} />;
}

function Chat({ concept, studentId, lang, update, rubricEdits, onExit }) {
  const rubric = RUBRICS[concept];
  if (!rubric) {
    return (
      <div className="card">
        <h2>{tx(CONCEPT_BY_ID[concept]?.name, lang)}</h2>
        <p className="muted">{t(lang, 'rubricComingSoon') || 'Chotu rubric for this topic is coming soon!'}</p>
        <button className="btn primary" onClick={onExit}>{t(lang, 'home')}</button>
      </div>
    );
  }

  const disabled = rubricEdits?.[concept] || [];
  const ideas = rubric.ideas.filter((i) => !disabled.includes(i.id));
  const [messages, setMessages] = useState([{ from: 'chotu', text: tx(rubric.opener, lang) }]);
  const [covered, setCovered] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [listening, setListening] = useState(false);
  const usedAI = useRef(false);
  const endRef = useRef(null);
  const recRef = useRef(null);
  const mountedRef = useRef(true);
  const aiOn = geminiAvailable();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try { recRef.current?.abort(); } catch {}
    };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);

  const turns = messages.filter((m) => m.from === 'student').length;

  const send = async () => {
    const text = input.trim();
    if (!text || busy || done) return;
    const history = [...messages, { from: 'student', text }];
    setMessages(history);
    setInput('');
    setBusy(true);
    let out;
    // Keyword check always runs (offline, deterministic) …
    const kw = [...new Set([...covered, ...matchIdeas(text, ideas)])];
    try {
      if (!aiOn) throw new Error('offline');
      // … and the AI adds its own judgement when available.
      const ai = await geminiTurn({ conceptName: CONCEPT_BY_ID[concept].name.en, lang, ideas, covered: kw, history });
      const all = [...new Set([...kw, ...ai.covered])];
      out = { reply: ai.reply, covered: all, done: all.length >= ideas.length };
      usedAI.current = true;
    } catch {
      // Offline simulated thinking pause so the thinking state is visually perceptible
      await new Promise((r) => setTimeout(r, 400));
      out = scriptedTurn({ text, ideas, covered, lang, turn: turns });
    }
    if (!mountedRef.current) return;
    setCovered(out.covered);
    setMessages([...history, { from: 'chotu', text: out.reply }]);
    setBusy(false);
    if (out.done || turns + 1 >= MAX_TURNS) finish(out.covered, [...history, { from: 'chotu', text: out.reply }]);
  };

  const finish = (cov = covered, msgs = messages) => {
    setDone(true);
    update((s) => {
      s.students[studentId].teachbacks.push({
        concept, score: cov.length, outOf: ideas.length, covered: cov,
        transcript: msgs, ai: usedAI.current, t: Date.now(),
      });
    });
  };

  const mic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      try { recRef.current?.stop(); } catch {}
      setListening(false);
      return;
    }
    try {
      const rec = new SR();
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      rec.interimResults = false;
      rec.onresult = (e) => setInput((v) => `${v} ${e.results[0][0].transcript}`.trim());
      rec.onend = () => { if (mountedRef.current) setListening(false); recRef.current = null; };
      rec.onerror = () => { if (mountedRef.current) setListening(false); recRef.current = null; };
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      recRef.current = null;
    }
  };
  const hasMic = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="session">
      <button className="link back" onClick={onExit}>← {t(lang, 'home')}</button>
      <div className="split">
        <div className="card chat">
          <div className="chat-head">
            <span className="avatar" aria-hidden="true">🧒</span>
            <div>
              <p className="eyebrow">{t(lang, 'teachChotu')} · {tx(CONCEPT_BY_ID[concept]?.name, lang)}</p>
              <p className="muted small">{t(lang, 'chotuMode')}: {aiOn ? t(lang, 'chotuAI') : t(lang, 'chotuOffline')}</p>
            </div>
          </div>
          <div className="messages">
            {messages.map((m, i) => (
              <p key={`${m.from}-${i}-${m.text.slice(0, 15)}`} className={`bubble ${m.from}`}>{m.text}</p>
            ))}
            {busy && <p className="bubble chotu muted">{t(lang, 'chotuThinking')}</p>}
            <div ref={endRef} />
          </div>
          {!done ? (
            <div className="composer">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? t(lang, 'listening') : t(lang, 'typeOrSpeak')}
                rows={2} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <div className="row">
                {hasMic && <button className={`btn ${listening ? 'accent' : ''}`} onClick={mic} aria-label="Speak">🎤</button>}
                <button className="btn primary" onClick={send} disabled={busy || !input.trim()}>{t(lang, 'send')}</button>
                {turns > 0 && <button className="btn" onClick={() => finish()}>{t(lang, 'finish')}</button>}
              </div>
            </div>
          ) : (
            <div className="score">
              <p className="eyebrow">{t(lang, 'teachScore')}</p>
              <p className="big-root">{covered.length} / {ideas.length}</p>
              <p className="muted">{t(lang, 'neverGrade')}</p>
              <button className="btn primary" onClick={onExit}>{t(lang, 'home')}</button>
            </div>
          )}
        </div>
        <div className="card side">
          <p className="eyebrow">{t(lang, 'ideasCovered')}</p>
          <ul className="checklist">
            {ideas.map((i) => (
              <li key={i.id} className={covered.includes(i.id) ? 'on' : ''}>
                <span aria-hidden="true">{covered.includes(i.id) ? '✓' : '○'}</span> {i.label[lang]}
                {done && !covered.includes(i.id) && <span className="muted small"> — {t(lang, 'missed')}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
