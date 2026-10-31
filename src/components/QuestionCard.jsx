import { useEffect, useMemo, useState } from 'react';
import { t, tx } from '../i18n.js';
import { shuffleOptions } from '../engine/randomize.js';

export { shuffleOptions };

/**
 * One question with the hint ladder: nudge → one worked step → easier twin.
 * Calls onAnswer(option, hintsUsed) once the student picks an option, then
 * shows feedback and a Continue button which calls onContinue().
 *
 * Options are deterministically shuffled per student/question to prevent
 * positional bias and double-bench copying in Indian classrooms.
 * Includes Voice Read-Aloud (Web Speech TTS) for accessible vernacular learning.
 */
export default function QuestionCard({ question, lang, label, onAnswer, onContinue, onEasier, hints = true, footer, seedKey = '', randomize = true }) {
  const [hintLevel, setHintLevel] = useState(0);
  const [picked, setPicked] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const options = useMemo(() => {
    if (!question) return [];
    if (!randomize) return question.options;
    return shuffleOptions(question.options, seedKey || question.id);
  }, [question?.id, question?.options, seedKey, randomize]);

  // Clean up any ongoing speech synthesis on unmount or question change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [question?.id]);

  if (!question) return null;

  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = () => {
    if (!hasSpeech) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const optLabel = t(lang, 'optionWord') || 'Option';
    const textToRead = `${tx(question.text, lang)}. ` + options.map((o, i) => `${optLabel} ${i + 1}: ${tx(o.text, lang)}`).join('. ');
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const choose = (opt) => {
    if (picked) return;
    if (speaking && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setPicked(opt);
    onAnswer?.(opt, hintLevel);
  };

  const correctOpt = question.options.find((o) => o.correct);

  return (
    <div className="card question">
      {label && <p className="eyebrow">{label}</p>}
      <div className="q-header">
        <h2 className="q-text">{tx(question.text, lang)}</h2>
        {hasSpeech && (
          <button
            type="button"
            className={`btn-tts ${speaking ? 'on' : ''}`}
            onClick={speak}
            title={speaking ? t(lang, 'stopAudio') : t(lang, 'readAloud')}
            aria-label={speaking ? t(lang, 'stopAudio') : t(lang, 'readAloud')}
          >
            {speaking ? '⏹️' : '🔊'}
          </button>
        )}
      </div>
      <div className="options">
        {options.map((o) => {
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
