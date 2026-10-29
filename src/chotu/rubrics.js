// Teach Chotu rubrics: 4 key ideas per concept that a good explanation covers.
// Teachers can read and edit these (Teacher view → Chotu rubric).
// `keys` are lowercase keywords in English, Hinglish and Hindi used by the
// offline (scripted) checker. With a Gemini key, the AI also judges coverage.
// `ask` = what Chotu says to nudge the student towards an idea he hasn't heard yet.

export const RUBRICS = {
  c6_int: {
    opener: {
      en: 'Didi, −3 is bigger than 2, right? It has a 3 in it, and 3 is bigger than 2!',
      hi: 'दीदी, −3 तो 2 से बड़ा है ना? उसमें 3 है, और 3 तो 2 से बड़ा है!',
    },
    ideas: [
      {
        id: 'right_bigger', label: { en: 'Further right on the number line = bigger', hi: 'संख्या रेखा पर ज़्यादा दाईं ओर = बड़ा' },
        keys: ['right', 'daay', 'daai', 'dayi', 'dahin', 'दाईं', 'दाएँ', 'दायें', 'दाहिन'],
        ask: { en: 'But how do I know which one is bigger just by looking?', hi: 'पर देखकर कैसे पता चलेगा कि कौन बड़ा है?' },
      },
      {
        id: 'neg_left', label: { en: 'Negative numbers are less than 0 (left of 0)', hi: 'ऋणात्मक संख्याएँ 0 से छोटी हैं (0 के बाईं ओर)' },
        keys: ['left', 'baay', 'baai', 'bayi', 'बाईं', 'बाएँ', 'बायें', 'less than 0', 'less than zero', 'below 0', 'below zero', 'zero se kam', 'zero se chhot', '0 se kam', '0 se chhot', 'शून्य से कम', 'शून्य से छोट', '0 से कम', '0 से छोट'],
        ask: { en: 'Where do minus numbers even live? Near 0 or somewhere else?', hi: 'ये माइनस वाली संख्याएँ रहती कहाँ हैं? 0 के पास या कहीं और?' },
      },
      {
        id: 'neg_order', label: { en: 'Among negatives, the bigger digit is the smaller number (−10 < −2)', hi: 'ऋणात्मक में बड़ा अंक = छोटी संख्या (−10 < −2)' },
        keys: ['debt', 'owe', 'karz', 'karj', 'udhaar', 'udhar', 'कर्ज़', 'कर्ज', 'उधार', 'far from zero', 'further from zero', 'closer to zero', 'zero ke paas', 'zero se door', 'शून्य के पास', 'शून्य से दूर', '0 के पास', '0 से दूर', '-10', '−10', '-5', '−5', '-8', '−8'],
        ask: { en: 'Okay… then which is bigger, −10 or −2? −10 has a bigger number!', hi: 'अच्छा… तो −10 और −2 में कौन बड़ा? −10 में तो बड़ी संख्या है!' },
      },
      {
        id: 'example', label: { en: 'Uses a picture or real example (number line, money, temperature)', hi: 'चित्र या असली उदाहरण देता/देती है (संख्या रेखा, पैसे, तापमान)' },
        keys: ['number line', 'numberline', 'sankhya rekha', 'संख्या रेखा', 'example', 'for example', 'jaise', 'जैसे', 'temperature', 'thermometer', 'तापमान', 'money', 'paise', 'rupee', '₹', 'पैसे', 'रुपये'],
        ask: { en: 'Can you show me with something real? I understand better with examples.', hi: 'कोई असली चीज़ से समझाओ ना? मुझे उदाहरण से जल्दी समझ आता है।' },
      },
    ],
  },
  c7_intops: {
    opener: {
      en: 'Bhaiya, 4 − (−3) is 1, right? You just do 4 minus 3!',
      hi: 'भैया, 4 − (−3) = 1 है ना? बस 4 में से 3 घटाओ!',
    },
    ideas: [
      {
        id: 'sub_neg_add', label: { en: 'Subtracting a negative is the same as adding', hi: 'ऋण को घटाना = जोड़ना' },
        keys: ['add', 'plus', 'jod', 'जोड़', 'प्लस', 'becomes +', 'ban jata', 'बन जाता', 'two minus', 'do minus', 'दो माइनस', 'minus minus', 'माइनस माइनस'],
        ask: { en: 'But there are two minus signs. What happens to them?', hi: 'पर इसमें दो माइनस हैं। उनका क्या होता है?' },
      },
      {
        id: 'move_right', label: { en: 'Adding moves right, subtracting moves left on the number line', hi: 'जोड़ना = दाईं ओर, घटाना = बाईं ओर' },
        keys: ['right', 'left', 'daay', 'baay', 'दाईं', 'बाईं', 'दाएँ', 'बाएँ', 'move', 'step', 'kadam', 'कदम', 'chalo', 'चलो'],
        ask: { en: 'How would I do −5 + 3 on the number line?', hi: '−5 + 3 संख्या रेखा पर कैसे करूँगा?' },
      },
      {
        id: 'answer', label: { en: 'Gets the right answer (4 − (−3) = 7)', hi: 'सही उत्तर (4 − (−3) = 7)' },
        keys: ['7', 'seven', 'saat', 'सात', '७'],
        ask: { en: 'So what is the actual answer then?', hi: 'तो असली उत्तर क्या है?' },
      },
      {
        id: 'example', label: { en: 'Uses a real example (debt, temperature, number line)', hi: 'असली उदाहरण (कर्ज़, तापमान, संख्या रेखा)' },
        keys: ['debt', 'owe', 'karz', 'udhar', 'कर्ज़', 'उधार', 'temperature', 'तापमान', 'number line', 'संख्या रेखा', 'example', 'jaise', 'जैसे', 'money', 'paise', 'पैसे', '₹'],
        ask: { en: 'Why should taking away a minus make it bigger? Show me with something real.', hi: 'माइनस हटाने से बड़ा क्यों होगा? किसी असली चीज़ से दिखाओ।' },
      },
    ],
  },
  c7_intmul: {
    opener: {
      en: 'Didi, (−3) × (−4) is −12. Minus times minus is more minus!',
      hi: 'दीदी, (−3) × (−4) = −12 है। माइनस गुणा माइनस = और ज़्यादा माइनस!',
    },
    ideas: [
      {
        id: 'same_pos', label: { en: 'Same signs give a positive answer', hi: 'एक जैसे चिह्न → धन उत्तर' },
        keys: ['positive', 'plus', 'dhan', 'धन', 'प्लस', 'same sign', 'same signs', 'ek jaise', 'एक जैसे', 'cancel', 'kat', 'कट'],
        ask: { en: 'So what happens when both numbers are negative?', hi: 'तो जब दोनों संख्याएँ माइनस हों तब क्या होता है?' },
      },
      {
        id: 'diff_neg', label: { en: 'Different signs give a negative answer', hi: 'अलग चिह्न → ऋण उत्तर' },
        keys: ['different', 'alag', 'अलग', 'one negative', 'ek minus', 'एक माइनस', 'negative × positive', 'minus into plus'],
        ask: { en: 'And what about (−5) × 4? Only one minus there.', hi: 'और (−5) × 4? उसमें तो एक ही माइनस है।' },
      },
      {
        id: 'answer', label: { en: 'Gets the right answer ((−3) × (−4) = 12)', hi: 'सही उत्तर ((−3) × (−4) = 12)' },
        keys: ['12', 'twelve', 'barah', 'बारह', '१२'],
        ask: { en: 'So what is (−3) × (−4) really?', hi: 'तो असल में (−3) × (−4) कितना है?' },
      },
      {
        id: 'why', label: { en: 'Explains why (pattern or real example)', hi: 'क्यों — पैटर्न या असली उदाहरण से समझाता/समझाती है' },
        keys: ['pattern', 'पैटर्न', 'because', 'kyunki', 'क्योंकि', 'debt', 'karz', 'कर्ज़', 'example', 'jaise', 'जैसे', 'each time', 'har baar', 'हर बार'],
        ask: { en: 'But WHY? It feels weird that two minuses make a plus.', hi: 'पर क्यों? अजीब लगता है कि दो माइनस से प्लस बनता है।' },
      },
    ],
  },
  c6_frac: {
    opener: {
      en: 'Bhaiya, 1/8 is bigger than 1/4, because 8 is bigger than 4!',
      hi: 'भैया, 1/8 तो 1/4 से बड़ा है, क्योंकि 8 बड़ा है 4 से!',
    },
    ideas: [
      {
        id: 'bottom_pieces', label: { en: 'The bottom number is how many equal pieces', hi: 'हर = कितने बराबर टुकड़े' },
        keys: ['pieces', 'parts', 'tukd', 'hisse', 'टुकड़', 'हिस्से', 'भाग', 'divide', 'baant', 'बाँट', 'बांट', 'cut', 'kaat', 'काट'],
        ask: { en: 'What does the 8 at the bottom even mean?', hi: 'नीचे वाला 8 मतलब क्या है?' },
      },
      {
        id: 'more_smaller', label: { en: 'More pieces means each piece is smaller', hi: 'ज़्यादा टुकड़े = हर टुकड़ा छोटा' },
        keys: ['smaller', 'chhot', 'chot', 'छोट', 'less', 'kam', 'कम', 'tiny'],
        ask: { en: 'But 8 pieces is more than 4 pieces! So I get more, no?', hi: 'पर 8 टुकड़े तो 4 से ज़्यादा हैं! तो मुझे ज़्यादा मिलेगा ना?' },
      },
      {
        id: 'answer', label: { en: 'Says 1/4 is bigger', hi: 'बताता/बताती है कि 1/4 बड़ा है' },
        keys: ['1/4 is bigger', '1/4 bada', '1/4 बड़ा', 'quarter is bigger', '1/4 is more', '1/4 zyada', '1/4 ज़्यादा', '1/4 >'],
        ask: { en: 'So which one should I pick if I want more cake?', hi: 'तो ज़्यादा केक चाहिए तो कौन सा चुनूँ?' },
      },
      {
        id: 'example', label: { en: 'Uses a real example (roti, pizza, chocolate)', hi: 'असली उदाहरण (रोटी, पिज़्ज़ा, चॉकलेट)' },
        keys: ['roti', 'रोटी', 'pizza', 'पिज़्ज़ा', 'cake', 'केक', 'chocolate', 'चॉकलेट', 'friends', 'dost', 'दोस्त', 'example', 'jaise', 'जैसे'],
        ask: { en: 'Can you explain it with food? I always understand food.', hi: 'खाने की चीज़ से समझाओ ना? खाना मुझे हमेशा समझ आता है।' },
      },
    ],
  },
  c6_var: {
    opener: {
      en: 'Didi, if x = 3 then 2x is 23! You just write 2 and then 3.',
      hi: 'दीदी, अगर x = 3 है तो 2x = 23! बस 2 लिखो फिर 3।',
    },
    ideas: [
      {
        id: 'times', label: { en: '2x means 2 × x', hi: '2x मतलब 2 × x' },
        keys: ['times', 'multiply', 'into', 'guna', 'गुणा', '×', '2 x 3', '2*3', 'twice', 'double', 'dugna', 'दुगना', 'दोगुना'],
        ask: { en: 'Then what does the 2 in front of x do?', hi: 'तो x के आगे वाला 2 करता क्या है?' },
      },
      {
        id: 'replace', label: { en: 'Replace the letter with its value', hi: 'अक्षर की जगह उसका मान रखो' },
        keys: ['replace', 'put', 'substitute', 'rakh', 'रख', 'jagah', 'जगह', 'value', 'maan', 'मान'],
        ask: { en: 'How do I use x = 3 then?', hi: 'तो x = 3 का इस्तेमाल कैसे करूँ?' },
      },
      {
        id: 'answer', label: { en: 'Gets the right answer (2x = 6)', hi: 'सही उत्तर (2x = 6)' },
        keys: ['6', 'six', 'chhe', 'chah', 'छह', 'छः', '६'],
        ask: { en: 'So what is 2x really, when x is 3?', hi: 'तो x = 3 हो तो 2x असल में कितना है?' },
      },
      {
        id: 'example', label: { en: 'Uses a real example (prices, objects)', hi: 'असली उदाहरण (कीमत, चीज़ें)' },
        keys: ['₹', 'rupee', 'price', 'cost', 'kimat', 'कीमत', 'samosa', 'समोसा', 'pen', 'पेन', 'example', 'jaise', 'जैसे'],
        ask: { en: 'Where would I ever use 2x in real life?', hi: 'असली ज़िंदगी में 2x कहाँ काम आएगा?' },
      },
    ],
  },
  c7_expr: {
    opener: {
      en: 'Bhaiya, 2x + 3y = 5xy. You just add everything together!',
      hi: 'भैया, 2x + 3y = 5xy। बस सब कुछ जोड़ दो!',
    },
    ideas: [
      {
        id: 'like_terms', label: { en: 'Only like terms (same letter) can be added', hi: 'सिर्फ समान पद (एक ही अक्षर) जुड़ते हैं' },
        keys: ['like term', 'same letter', 'same variable', 'samaan', 'समान', 'ek hi akshar', 'एक ही अक्षर', 'different letter', 'alag akshar', 'अलग अक्षर', 'unlike'],
        ask: { en: 'Why can’t I add x and y? They’re both letters.', hi: 'x और y क्यों नहीं जुड़ते? दोनों अक्षर ही तो हैं।' },
      },
      {
        id: 'stays', label: { en: '2x + 3y stays as it is', hi: '2x + 3y वैसा ही रहता है' },
        keys: ['stays', 'same', 'cannot', "can't", 'nahi', 'नहीं', 'waisa', 'वैसा', 'already'],
        ask: { en: 'So what is 2x + 3y then?', hi: 'तो 2x + 3y क्या बनेगा?' },
      },
      {
        id: 'sign', label: { en: 'Keeps the sign when combining (5x − 7x = −2x)', hi: 'मिलाते समय चिह्न रखता/रखती है (5x − 7x = −2x)' },
        keys: ['-2x', '−2x', 'minus 2x', 'sign', 'chinh', 'चिह्न', 'minus'],
        ask: { en: 'And 5x − 7x? That’s 2x, right?', hi: 'और 5x − 7x? वो तो 2x है ना?' },
      },
      {
        id: 'example', label: { en: 'Uses a real example (fruits, objects)', hi: 'असली उदाहरण (फल, चीज़ें)' },
        keys: ['apple', 'mango', 'banana', 'aam', 'kela', 'आम', 'केले', 'केला', 'सेब', 'fruit', 'example', 'jaise', 'जैसे'],
        ask: { en: 'Show me with real things, please?', hi: 'असली चीज़ों से दिखाओ ना?' },
      },
    ],
  },
};

export const CHOTU_CONCEPTS = Object.keys(RUBRICS);
