import { CONCEPT_BY_ID } from '../data/concepts.js';
import { band } from '../engine/bkt.js';
import { t, cls, tx } from '../i18n.js';

export const BAND_COLORS = {
  mastered: 'var(--ok)',
  ok: 'var(--okish)',
  shaky: 'var(--shaky)',
  weak: 'var(--gap)',
};

export function MasteryBar({ p, lang, showLabel = true }) {
  const b = band(p);
  return (
    <div className="mbar" title={`${Math.round(p * 100)}%`}>
      <div className="mbar-track"><div className="mbar-fill" style={{ width: `${Math.round(p * 100)}%`, background: BAND_COLORS[b] }} /></div>
      {showLabel && <span className="mbar-label">{Math.round(p * 100)}% · {t(lang, b)}</span>}
    </div>
  );
}

/** A simple number line from −6 to 6 with optional highlighted points. */
export function NumberLine({ points = [-3, 2], lang = 'en' }) {
  const xs = (n) => 20 + (n + 6) * 30;
  return (
    <svg viewBox="0 0 400 70" className="numberline" role="img" aria-label="Number line from −6 to 6">
      <line x1="10" y1="35" x2="390" y2="35" stroke="currentColor" strokeWidth="2" />
      <path d="M390 35 l-8 -5 v10 z" fill="currentColor" />
      <path d="M10 35 l8 -5 v10 z" fill="currentColor" />
      {Array.from({ length: 13 }, (_, i) => i - 6).map((n) => (
        <g key={n}>
          <line x1={xs(n)} y1="29" x2={xs(n)} y2="41" stroke="currentColor" strokeWidth={n === 0 ? 3 : 1.5} />
          <text x={xs(n)} y="60" textAnchor="middle" fontSize="12" fill="currentColor">{n < 0 ? `−${-n}` : n}</text>
        </g>
      ))}
      {points.map((p, i) => (
        <circle key={`pt-${p}-${i}`} cx={xs(p)} cy="35" r="7" fill={i === points.length - 1 ? 'var(--accent)' : 'var(--blue)'} />
      ))}
      <text x="370" y="18" fontSize="11" fill="currentColor" textAnchor="end">{lang === 'hi' ? 'बड़ा →' : lang === 'hinglish' ? 'Bada →' : 'bigger →'}</text>
      <text x="30" y="18" fontSize="11" fill="currentColor">{lang === 'hi' ? '← छोटा' : lang === 'hinglish' ? '← Chhota' : '← smaller'}</text>
    </svg>
  );
}

/**
 * The thread: a vertical chain of concept nodes, from the original question's
 * concept (top) down to the root (bottom).
 */
export function Thread({ nodes, lang }) {
  return (
    <ol className="thread">
      {nodes.map((n, i) => (
        <li key={`${n.concept}-${n.state}-${i}`} className={`thread-node ${n.state}`}>
          <span className="knot" aria-hidden="true" />
          <div>
            <p className="thread-grade">{cls(lang, CONCEPT_BY_ID[n.concept].grade)}</p>
            <p className="thread-name">{tx(CONCEPT_BY_ID[n.concept].name, lang)}</p>
            {n.note && <p className="thread-note">{n.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
