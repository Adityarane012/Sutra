// Offline Chotu: works with no internet and no API key.
// Checks which rubric ideas the student's explanation covers (keyword match
// in English, Hinglish and Hindi), then asks a curious follow-up aimed at an
// idea that is still missing.

const ACKS = {
  en: ['Ohh! ', 'Hmm, okay… ', 'Wait, really? ', 'Achha! '],
  hi: ['अच्छा! ', 'हम्म, ठीक है… ', 'सच में? ', 'ओह! '],
};
const CONFUSED = {
  en: 'I didn’t get that… ',
  hi: 'मुझे समझ नहीं आया… ',
};

export function normalise(text) {
  return text
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ');
}

/** Which rubric ideas does this text cover? */
export function matchIdeas(text, ideas) {
  const t = normalise(text);
  return ideas
    .filter((idea) => idea.keys.some((k) => t.includes(normalise(k))))
    .map((idea) => idea.id);
}

/**
 * One Chotu turn. Returns { reply, covered } where covered = ids newly or
 * previously covered.
 */
export function scriptedTurn({ text, ideas, covered, lang, turn }) {
  const found = matchIdeas(text, ideas).filter((id) => !covered.includes(id));
  const all = [...covered, ...found];
  const missing = ideas.filter((i) => !all.includes(i.id));
  const ack = found.length ? ACKS[lang][turn % ACKS[lang].length] : CONFUSED[lang];
  if (!missing.length) {
    return {
      covered: all,
      reply: lang === 'hi'
        ? `${ack}अब मुझे पूरा समझ आ गया! तुम बहुत अच्छा समझाते हो। 🙌`
        : `${ack}Now I totally get it! You explain really well. 🙌`,
      done: true,
    };
  }
  return { covered: all, reply: ack + missing[0].ask[lang], done: false };
}
