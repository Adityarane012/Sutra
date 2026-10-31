// AI Chotu using the Gemini API. Only the explanation text is sent — never
// the student's name or ID. If there is no key, no internet, or any error,
// the caller falls back to the scripted Chotu.
//
// Demo note: a key in VITE_GEMINI_API_KEY is visible in the browser. That is
// fine for a hackathon demo; in production the call goes through our backend.

const KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const MODELS = [import.meta.env?.VITE_GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-2.5-flash'].filter(Boolean);

export const geminiAvailable = () => !!KEY && typeof navigator !== 'undefined' && navigator.onLine;

function prompt({ conceptName, lang, ideas, covered, history }) {
  const ideaList = ideas.map((i) => `- ${i.id}: ${i.label.en}`).join('\n');
  const convo = history.map((m) => `${m.from === 'chotu' ? 'Chotu' : 'Student'}: ${m.text}`).join('\n');
  return `You are "Chotu", a curious 8-year-old younger sibling. A school student (Class 6–10, India) is teaching you the maths concept "${conceptName}".
Stay in character: short (max 2 sentences), friendly, a little confused, never give the answer yourself. Ask "but why?" style questions. If the student is wrong, voice a common misconception so they must correct you.
Reply in ${lang === 'hi' ? 'Hindi (Devanagari) or natural Hinglish, matching the student' : lang === 'hinglish' ? 'natural conversational Hinglish (Roman script, mixing simple English and conversational Hindi, matching the student)' : 'simple English (Hinglish is fine if the student uses it)'}.

Rubric ideas a good explanation covers:
${ideaList}
Already covered: ${covered.join(', ') || 'none'}

Conversation so far:
${convo}

Return ONLY JSON: {"reply": "<Chotu's next line>", "covered": ["<idea ids the student's explanations have clearly covered so far>"]}`;
}

async function call(model, body, signal) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const json = JSON.parse(text.replace(/^```json\s*|```$/g, '').trim());
  if (typeof json.reply !== 'string') throw new Error('bad reply');
  return json;
}

export async function geminiTurn(args) {
  const body = {
    contents: [{ parts: [{ text: prompt(args) }] }],
    generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    let lastErr;
    for (const model of MODELS) {
      try {
        const out = await call(model, body, ctrl.signal);
        const valid = new Set(args.ideas.map((i) => i.id));
        return { reply: out.reply, covered: (out.covered || []).filter((id) => valid.has(id)) };
      } catch (e) {
        lastErr = e;
        if (ctrl.signal.aborted) break;
      }
    }
    throw lastErr;
  } finally {
    clearTimeout(timer);
  }
}
