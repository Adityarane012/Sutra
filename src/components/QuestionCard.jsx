import { useState } from 'react';
import { t, tx } from '../i18n.js';

/**
 * One question with the hint ladder: nudge → one worked step → easier twin.
 * Calls onAnswer(option, hintsUsed) once the student picks an option, then
 * shows feedback and a Continue button which calls onContinue().
 */
export default function QuestionCard({ question, lang, label, onAnswer, onContinue, onEasier, hints = true, footer }) {
  const [hintLevel, setHintLevel] = useState(0);
  const [picked, setPicked] = useState(null);

  const choose = (opt) => {
    if (picked) return;
    setPicked(opt);
    onAnswer?.(opt, hintLevel);
  };

  const correctOpt = question.options.find((o) => o.correct);

  return (
    <div className="card question">
      {label && <p className="eyebrow">{label}</p>}
      <h2 className="q-text">{tx(question.text, lang)}</h2>
      <div className="options">
        {question.options.map((o) => {
          const state = picked ? (o.correct ? 'right' : o.id === picked.id ? 'wrong' : 'dim') : '';
          return (
            <button key={o.id} className={`option ${state}`} onClick={() => choose(o)} disabled={!!picked}>
              {tx(o.text, lang)}
              {picked && o.correct && <span className="tag-ok"> ✓</span>}
              {picked && o.id === picked.id && !o.correct && <span className="tag-bad"> ✗</span>}
            </button>
          );
        })}
      </div>

      {!picked && hints && (
        <div className="hints">
          {hintLevel === 0 && <button className="link" onClick={() => setHintLevel(1)}>💡 {t(lang, 'needHint')}</button>}
          {hintLevel >= 1 && <p className="hint"><b>{t(lang, 'hint1')}:</b> {tx(question.hint, lang)}</p>}
          {hintLevel === 1 && <button className="link" onClick={() => setHintLevel(2)}>{t(lang, 'hint2')} →</button>}
          {hintLevel >= 2 && <p className="hint"><b>{t(lang, 'step')}:</b> {tx(question.step, lang)}</p>}
          {hintLevel === 2 && onEasier && <button className="link" onClick={() => { setHintLevel(3); onEasier(); }}>{t(lang, 'hint3')} →</button>}
        </div>
      )}

      {picked && (
        <div className={`feedback ${picked.correct ? 'good' : 'bad'}`}>
          <p><b>{picked.correct ? t(lang, 'correct') : t(lang, 'notQuite')}</b>
            {!picked.correct && <> {t(lang, 'answerWas')} <b>{tx(correctOpt.text, lang)}</b>.</>}
          </p>
          {!picked.correct && <p className="muted">{tx(question.step, lang)}</p>}
          <button className="btn primary" onClick={onContinue}>{t(lang, 'continue')} →</button>
        </div>
      )}
      {footer}
    </div>
  );
}
