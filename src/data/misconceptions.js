// Misconceptions: the "why" behind a wrong answer.
// Every wrong option in the question bank is tagged with one of these.
// `concept` = the concept where this misconception really lives.
// `probe`   = which prerequisite to check next if the student shows it
//             (null = this is already a foundation concept).
// Table: misconceptions (see schema.sql)

export const MISCONCEPTIONS = {
  m_order_neg: {
    concept: 'c6_int', probe: null,
    text: { en: 'Thinks −5 is bigger than −2 because 5 > 2', hi: 'सोचता/सोचती है कि −5, −2 से बड़ा है क्योंकि 5 > 2' },
  },
  m_neg_ignore: {
    concept: 'c6_int', probe: null,
    text: { en: 'Ignores the minus sign', hi: 'ऋण चिह्न को अनदेखा करता/करती है' },
  },
  m_sub_neg: {
    concept: 'c7_intops', probe: 'c6_int',
    text: { en: 'Treats a − (−b) as a − b', hi: 'a − (−b) को a − b समझता/समझती है' },
  },
  m_add_signs: {
    concept: 'c7_intops', probe: 'c6_int',
    text: { en: 'Adds the numbers and keeps the minus sign (−5 + 3 = −8)', hi: 'संख्याएँ जोड़कर ऋण चिह्न लगा देता/देती है (−5 + 3 = −8)' },
  },
  m_mul_sign: {
    concept: 'c7_intmul', probe: 'c7_intops',
    text: { en: 'Gets the sign wrong when multiplying negatives', hi: 'ऋणात्मक संख्याओं के गुणा में चिह्न गलत लगाता/लगाती है' },
  },
  m_mul_add: {
    concept: 'c7_intmul', probe: 'c7_intops',
    text: { en: 'Adds instead of multiplying', hi: 'गुणा की जगह जोड़ देता/देती है' },
  },
  m_frac_bigger_den: {
    concept: 'c6_frac', probe: null,
    text: { en: 'Thinks a bigger denominator means a bigger fraction', hi: 'सोचता/सोचती है कि बड़ा हर मतलब बड़ी भिन्न' },
  },
  m_frac_equiv: {
    concept: 'c6_frac', probe: null,
    text: { en: 'Changes only the top or only the bottom of a fraction', hi: 'भिन्न का सिर्फ अंश या सिर्फ हर बदलता/बदलती है' },
  },
  m_frac_addtop: {
    concept: 'c7_fracops', probe: 'c6_frac',
    text: { en: 'Adds tops and bottoms (1/2 + 1/3 = 2/5)', hi: 'अंश से अंश और हर से हर जोड़ देता/देती है (1/2 + 1/3 = 2/5)' },
  },
  m_frac_flip: {
    concept: 'c7_fracops', probe: 'c6_frac',
    text: { en: 'Mixes up the rules for multiplying and dividing fractions', hi: 'भिन्नों के गुणा और भाग के नियम मिला देता/देती है' },
  },
  m_var_label: {
    concept: 'c6_var', probe: null,
    text: { en: 'Reads 2x as “2 and x” or a label, not “2 times x”', hi: '2x को “2 गुणा x” की जगह “2 और x” पढ़ता/पढ़ती है' },
  },
  m_unlike_add: {
    concept: 'c7_expr', probe: 'c6_var',
    text: { en: 'Adds unlike terms (2x + 3y = 5xy)', hi: 'असमान पदों को जोड़ देता/देती है (2x + 3y = 5xy)' },
  },
  m_like_sign: {
    concept: 'c7_expr', probe: 'c7_intops',
    text: { en: 'Drops the sign when combining like terms (5x − 7x = 2x)', hi: 'समान पद जोड़ते समय चिह्न छोड़ देता/देती है (5x − 7x = 2x)' },
  },
  m_move_sign: {
    concept: 'c7_simpleeq', probe: 'c7_intops',
    text: { en: 'Moves a term across “=” without changing its sign', hi: 'पद को “=” के पार ले जाते समय चिह्न नहीं बदलता/बदलती' },
  },
  m_divide_wrong: {
    concept: 'c7_simpleeq', probe: 'c6_var',
    text: { en: 'Subtracts or multiplies instead of dividing (3x = 12 → x = 9)', hi: 'भाग की जगह घटाता/गुणा करता है (3x = 12 → x = 9)' },
  },
  m_lineq_frac: {
    concept: 'c8_lineq', probe: 'c7_fracops',
    text: { en: 'Clears a fraction from only one term', hi: 'भिन्न को सिर्फ एक पद से हटाता/हटाती है' },
  },
  m_bracket_first: {
    concept: 'c8_brackets', probe: 'c7_expr',
    text: { en: 'Multiplies only the first term in the bracket: 3(x + 2) = 3x + 2', hi: 'कोष्ठक के सिर्फ पहले पद से गुणा करता/करती है: 3(x + 2) = 3x + 2' },
  },
};
