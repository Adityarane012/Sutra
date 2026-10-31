// Offline Chotu: works with no internet and no API key.
// Checks which rubric ideas the student's explanation covers (keyword match
// in English, Hinglish and Hindi), then asks a curious follow-up aimed at an
// idea that is still missing.

const ACKS_FOUND = {
  en: ['Aha, got it! ', 'Ohh, that makes sense! ', 'Nice point! ', 'Wait, really? That works! '],
  hi: ['अच्छा! समझ गया। ', 'अरे वाह, बिल्कुल सही! ', 'ओह, सच में! ', 'बहुत बढ़िया! '],
  hinglish: ['Aha, samajh gaya! ', 'Achha, got it! ', 'Wah, sahi point pakda! ', 'Ohh nice! '],
};

const CLARIFY_ACKS = {
  en: [
    'I didn’t get that… ',
    'Hmm, can you explain a bit more? ',
    'Okay, but tell me: ',
    'Wait, I’m still a bit curious… ',
  ],
  hi: [
    'मुझे समझ नहीं आया… ',
    'हम्म, थोड़ा और समझाओ ना? ',
    'अच्छा, पर यह बताओ: ',
    'रुको, मुझे अभी भी संशय है… ',
  ],
  hinglish: [
    'Mujhe samajh nahi aaya… ',
    'Hmm, thoda aur explain karo na? ',
    'Achha, par ye batao: ',
    'Wait, thoda confuse ho gaya… ',
  ],
};

export function normalise(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ');
}

/** Which rubric ideas does this text cover? */
export function matchIdeas(text, ideas) {
  const norm = normalise(text);
  if (!norm.trim()) return [];
  // Tokenize words for whole-word boundary matching on short keys
  const words = new Set(norm.trim().split(/[^a-z0-9\u0900-\u097F=/-]+/).filter(Boolean));

  return ideas
    .filter((idea) => {
      return idea.keys.some((rawKey) => {
        const k = normalise(rawKey);
        if (!k) return false;
        // Short single words (e.g. 'no', 'yes', 'line', 'ha', 'nahi', '7', '12') must match whole tokens
        if (!k.includes(' ') && k.length <= 4) {
          if (words.has(k)) return true;
          // Coordinates or expressions like x=0, y=0, x=6
          if (norm.includes(k)) return true;
          return false;
        }
        // Multi-word phrases or longer keywords: match substring
        return norm.includes(k);
      });
    })
    .map((idea) => idea.id);
}

/**
 * One Chotu turn. Returns { reply, covered, done } where covered = ids newly or
 * previously covered. Never repeats the same question in successive turns.
 */
export function scriptedTurn({ text, ideas, covered = [], lang = 'en', turn = 0, history = [] }) {
  const newlyFound = matchIdeas(text, ideas).filter((id) => !covered.includes(id));
  const all = [...new Set([...covered, ...newlyFound])];
  const missing = ideas.filter((i) => !all.includes(i.id));

  // Determine acknowledgement prefix
  let ack = '';
  if (newlyFound.length > 0) {
    const list = ACKS_FOUND[lang] || ACKS_FOUND.en;
    ack = list[turn % list.length];
  } else {
    const list = CLARIFY_ACKS[lang] || CLARIFY_ACKS.en;
    ack = list[turn % list.length];
  }

  // All ideas covered -> victory!
  if (!missing.length) {
    const doneMsgs = {
      en: 'Now I totally get it! You explain really well. 🙌',
      hi: 'अब मुझे पूरा समझ आ गया! तुम बहुत अच्छा समझाते हो। 🙌',
      hinglish: 'Ab mujhe poora samajh aa gaya! Tum bohot badhiya explain karte ho. 🙌',
    };
    return {
      covered: all,
      reply: ack + (doneMsgs[lang] || doneMsgs.en),
      done: true,
    };
  }

  // Determine what Chotu has already asked in this conversation
  const askedQuestions = history
    .filter((m) => m.from === 'chotu')
    .map((m) => m.text.toLowerCase());

  // Pick a missing idea whose question hasn't already been asked
  const unasked = missing.filter((m) => {
    const askEn = m.ask?.en?.toLowerCase() || '';
    const askHi = m.ask?.hi?.toLowerCase() || '';
    return !askedQuestions.some(
      (prev) => (askEn && prev.includes(askEn.slice(0, 20))) || (askHi && prev.includes(askHi.slice(0, 20)))
    );
  });

  // Target idea: prefer unasked missing ideas; if all were asked, rotate through remaining missing ideas
  const target = unasked[0] || missing[turn % missing.length] || missing[0];
  const askText = target?.ask?.[lang] || target?.ask?.hinglish || target?.ask?.en || target?.ask?.hi || '';

  return {
    covered: all,
    reply: ack + askText,
    done: false,
  };
}
