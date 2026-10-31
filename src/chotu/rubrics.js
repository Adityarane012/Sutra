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
  c7_fracops: {
    opener: {
      en: 'Didi, 1/2 + 1/3 is 2/5, right? You just add the tops and add the bottoms!',
      hi: 'दीदी, 1/2 + 1/3 = 2/5 है ना? बस ऊपर वाले जोड़ो और नीचे वाले जोड़ो!',
    },
    ideas: [
      {
        id: 'common_denom', label: { en: 'Need a common denominator (LCM) before adding', hi: 'जोड़ने से पहले समान हर (LCM) चाहिए' },
        keys: ['common', 'denominator', 'lcm', 'same', 'har', 'samaan', 'लसावि', 'समान हर', 'equal denominator', '6'],
        ask: { en: 'Why can’t I just add the bottom numbers directly?', hi: 'नीचे वाली संख्याएँ सीधे क्यों नहीं जुड़तीं?' },
      },
      {
        id: 'multiply_reciprocal', label: { en: 'Dividing by a fraction is multiplying by its reciprocal', hi: 'भिन्न से भाग देना = उल्टे से गुणा करना' },
        keys: ['flip', 'invert', 'reciprocal', 'ulta', 'उल्टा', 'palat', 'multiply', 'guna', 'गुना'],
        ask: { en: 'What do I do when I need to divide by a fraction like 2/3?', hi: 'जब 2/3 जैसी भिन्न से भाग देना हो तो क्या करें?' },
      },
      {
        id: 'cross_cancel', label: { en: 'Simplify or cross-cancel common factors', hi: 'उभयनिष्ठ गुणनखंड काटकर सरल करो' },
        keys: ['simplify', 'cancel', 'divide', 'kaat', 'chhota', 'सरल', 'काट'],
        ask: { en: 'How do I make a big fraction like 12/18 smaller?', hi: '12/18 जैसी बड़ी भिन्न को छोटा कैसे करें?' },
      },
      {
        id: 'parts_whole', label: { en: 'Explains fractions as equal slices of a whole', hi: 'भिन्न को पूरे के बराबर हिस्सों के रूप में समझाता है' },
        keys: ['pizza', 'roti', 'slice', 'tukda', 'part', 'whole', 'रोटी', 'टुकड़ा', 'हिस्सा', 'बराबर'],
        ask: { en: 'Can you show me with a picture like food or drawings?', hi: 'खाने या चित्र से समझाओ ना?' },
      },
    ],
  },
  c7_simpleeq: {
    opener: {
      en: 'Bhaiya, in x + 5 = 12, can’t I just guess numbers until one works?',
      hi: 'भैया, x + 5 = 12 में क्या मैं सिर्फ अंदाज़ा नहीं लगा सकता जब तक सही ना मिले?',
    },
    ideas: [
      {
        id: 'balance_scale', label: { en: 'An equation is a balance scale: do the same to both sides', hi: 'समीकरण तराज़ू है: दोनों तरफ एक जैसी संक्रिया करो' },
        keys: ['balance', 'scale', 'tarazu', 'both sides', 'dono taraf', 'तराज़ू', 'दोनों तरफ', 'same'],
        ask: { en: 'Why do we have to do things to both sides of the equal sign?', hi: 'बराबर के दोनों तरफ एक जैसा काम क्यों करना पड़ता है?' },
      },
      {
        id: 'inverse_op', label: { en: 'Use inverse operations to isolate x (subtract 5)', hi: 'x निकालने के लिए उल्टी संक्रिया करो (5 घटाओ)' },
        keys: ['subtract 5', 'minus 5', 'inverse', 'opposite', 'ulta', 'घटाओ', 'उल्टा', '5 minus'],
        ask: { en: 'How do I remove the + 5 from next to the x?', hi: 'x के पास से + 5 को कैसे हटाऊँ?' },
      },
      {
        id: 'isolate_var', label: { en: 'The goal is to get the variable alone on one side', hi: 'लक्ष्य चर (x) को एक तरफ अकेला करना है' },
        keys: ['alone', 'isolate', 'akela', 'find x', 'x =', 'अकेला'],
        ask: { en: 'When do I know the equation is solved?', hi: 'मुझे कैसे पता चलेगा कि समीकरण हल हो गया?' },
      },
      {
        id: 'check_sub', label: { en: 'Substitute the answer back to check (7 + 5 = 12)', hi: 'जाँच के लिए उत्तर वापस रखकर देखो (7 + 5 = 12)' },
        keys: ['check', 'put back', 'substitute', 'verify', '7', 'जाँच', 'रख कर'],
        ask: { en: 'How can I be completely sure my answer 7 is right?', hi: 'मुझे पूरा यकीन कैसे हो कि मेरा उत्तर 7 सही है?' },
      },
    ],
  },
  c8_lineq: {
    opener: {
      en: 'Didi, in 3x + 4 = x + 10, how can x be on both sides? That’s confusing!',
      hi: 'दीदी, 3x + 4 = x + 10 में x दोनों तरफ कैसे हो सकता है?',
    },
    ideas: [
      {
        id: 'collect_vars', label: { en: 'Bring variable terms to one side by subtracting x', hi: 'x घटाकर चर वाले पदों को एक तरफ लाओ' },
        keys: ['one side', 'collect', 'subtract x', 'minus x', 'ek taraf', '2x', 'एक तरफ'],
        ask: { en: 'How do I deal with having x on both sides?', hi: 'दोनों तरफ x हो तो क्या करूँ?' },
      },
      {
        id: 'collect_const', label: { en: 'Bring numbers/constants to the other side', hi: 'संख्याओं को दूसरी तरफ ले जाओ' },
        keys: ['constant', 'numbers', 'minus 4', 'subtract 4', 'dusri taraf', 'दूसरी तरफ', '6'],
        ask: { en: 'And what happens to the numbers like +4 and +10?', hi: '+4 और +10 जैसी संख्याओं का क्या होगा?' },
      },
      {
        id: 'divide_coeff', label: { en: 'Divide by the coefficient of x at the end', hi: 'अंत में x के गुणांक से भाग दो' },
        keys: ['divide by 2', 'coefficient', 'gunank', 'गुणांक', 'भाग दो', 'divide'],
        ask: { en: 'If 2x = 6, what is the very last step to find x?', hi: 'अगर 2x = 6 है, तो x निकालने का आखिरी कदम क्या है?' },
      },
      {
        id: 'check_sides', label: { en: 'Check that LHS equals RHS with the solution', hi: 'जाँचो कि बायाँ पक्ष और दायाँ पक्ष बराबर हैं' },
        keys: ['lhs', 'rhs', 'equal', 'barabar', 'check', 'बराबर', 'दोनों पक्ष'],
        ask: { en: 'How do we check if x = 3 really works?', hi: 'जाँच कैसे करें कि x = 3 सच में सही है?' },
      },
    ],
  },
  c8_brackets: {
    opener: {
      en: 'Bhaiya, 3(2x + 4) is 6x + 4, right? The 3 only multiplies the first thing!',
      hi: 'भैया, 3(2x + 4) = 6x + 4 है ना? 3 सिर्फ पहली चीज़ से गुणा होगा!',
    },
    ideas: [
      {
        id: 'distribute_all', label: { en: 'Multiply the outside number by EVERY term inside', hi: 'बाहर वाली संख्या से कोष्ठक के हर पद को गुणा करो' },
        keys: ['every', 'both', 'distribute', 'dono', '12', 'दोनों', 'सबको', 'हर पद'],
        ask: { en: 'Why doesn’t the 3 just stop at the 2x?', hi: '3 सिर्फ 2x से ही गुणा क्यों नहीं होता?' },
      },
      {
        id: 'sign_brackets', label: { en: 'A minus outside flips the signs inside: −(a − b) = −a + b', hi: 'बाहर ऋण होने पर अंदर के चिह्न पलटते हैं' },
        keys: ['minus outside', 'sign flip', 'becomes plus', 'chinh', 'चिह्न', 'माइनस माइनस', 'plus'],
        ask: { en: 'What if there is a minus sign outside like −2(x − 5)?', hi: 'अगर बाहर माइनस हो जैसे −2(x − 5), तब क्या होगा?' },
      },
      {
        id: 'binomial_foil', label: { en: 'Multiplying two brackets (x+a)(x+b) gives 4 products', hi: 'दो कोष्ठकों को गुणा करने पर 4 पद बनते हैं' },
        keys: ['four', 'terms', 'foil', 'middle term', 'x^2', 'चार पद', 'बीच का पद'],
        ask: { en: 'How do we multiply two brackets like (x + 2)(x + 3)?', hi: '(x + 2)(x + 3) जैसे दो कोष्ठक कैसे गुणा करते हैं?' },
      },
      {
        id: 'area_rectangle', label: { en: 'Shows expansion as the area of a divided rectangle', hi: 'विस्तार को बंटे हुए आयत के क्षेत्रफल के रूप में समझाता है' },
        keys: ['rectangle', 'area', 'grid', 'box', 'kshetraphal', 'आयत', 'क्षेत्रफल'],
        ask: { en: 'Can you draw a rectangle or picture to show why this works?', hi: 'चित्र बनाकर दिखा सकते हो यह कैसे काम करता है?' },
      },
    ],
  },
  c9_poly: {
    opener: {
      en: 'Didi, to find p(2) for x² − 5x + 6, do I just put 2 next to the x?',
      hi: 'दीदी, x² − 5x + 6 में p(2) निकालने के लिए क्या बस x के बगल में 2 लिख दूँ?',
    },
    ideas: [
      {
        id: 'substitute_var', label: { en: 'Replace every x with the value: 2² − 5(2) + 6', hi: 'हर x की जगह वह मान रखो: 2² − 5(2) + 6' },
        keys: ['replace', 'substitute', 'put 2', 'x ki jagah', 'x की जगह', 'मान रखो'],
        ask: { en: 'What does p(2) actually mean mathematically?', hi: 'गणित में p(2) का असल में क्या मतलब है?' },
      },
      {
        id: 'powers_first', label: { en: 'Calculate powers first before multiplying: 2² = 4', hi: 'गुणा करने से पहले घात हल करो: 2² = 4' },
        keys: ['square first', 'power', '4', 'bodmas', 'घात', 'वर्ग'],
        ask: { en: 'Do I multiply 5 by 2 first or calculate the square first?', hi: 'पहले वर्ग करूँ या पहले गुणा करूँ?' },
      },
      {
        id: 'zero_poly', label: { en: 'If p(a) = 0, then a is called a zero / root of the polynomial', hi: 'अगर p(a) = 0 आता है, तो a बहुपद का शून्यक है' },
        keys: ['zero', 'root', 'shunya', 'shunyak', '0', 'शून्यक', 'शून्य'],
        ask: { en: 'What is special if the answer comes out to exactly 0?', hi: 'अगर उत्तर 0 आ जाए तो उसे क्या कहते हैं?' },
      },
      {
        id: 'negative_brackets', label: { en: 'Use brackets when substituting negatives: (−2)² = +4', hi: 'ऋणात्मक संख्या रखते समय कोष्ठक लगाओ: (−2)² = +4' },
        keys: ['negative', 'bracket', '+4', 'plus 4', 'minus square', 'कोष्ठक'],
        ask: { en: 'What if we had to find p(−2)? Does the square become minus or plus?', hi: 'अगर p(−2) निकालना हो, तो वर्ग माइनस बनेगा या प्लस?' },
      },
    ],
  },
  c9_lin2: {
    opener: {
      en: 'Bhaiya, 2x + 3y = 12 has only ONE answer (x=3, y=2), right?',
      hi: 'भैया, 2x + 3y = 12 का सिर्फ एक ही उत्तर (x=3, y=2) हो सकता है ना?',
    },
    ideas: [
      {
        id: 'infinite_solutions', label: { en: 'Linear equation in 2 variables has infinitely many solutions', hi: 'दो चरों वाले रैखिक समीकरण के अनगिनत हल होते हैं' },
        keys: [
          'infinite', 'many', 'anant', 'anek', 'more than one', 'pairs', 'अनंत', 'अनेक', 'कई हल',
          'no', 'nahi', 'nahin', 'wrong', 'galat', 'false', 'not one', 'not only one', 'more',
          'yes', 'haan', 'ha', 'true', 'sahi', 'bilkul', 'of course', 'unlimited', 'bahut',
          'multiple', 'x=6', 'x=0', 'y=0', 'y=4', 'नहीं', 'गलत', 'हाँ', 'ज्यादा', 'अनगिनत'
        ],
        ask: { en: 'Are there really more pairs of x and y that work?', hi: 'क्या x और y के और भी जोड़े हो सकते हैं?' },
      },
      {
        id: 'graph_line', label: { en: 'Graph of the equation is a straight line', hi: 'इस समीकरण का आलेख (ग्राफ) एक सीधी रेखा है' },
        keys: [
          'line', 'straight line', 'graph', 'rekha', 'seedhi', 'ग्राफ', 'सीधी रेखा',
          'straight', 'linear', 'plot', 'drawing', 'सीधी', 'रेखा'
        ],
        ask: { en: 'If we draw all these points on a graph paper, what shape appears?', hi: 'ग्राफ पर इन बिंदुओं को बनाएँ तो कौन सा आकार बनता है?' },
      },
      {
        id: 'find_ordered_pairs', label: { en: 'Pick an x, solve for y (e.g. x=0 gives y=4; y=0 gives x=6)', hi: 'कोई भी x चुनो और y निकालो (जैसे x=0 पर y=4; y=0 पर x=6)' },
        keys: [
          'x=0', 'y=0', 'x=6', 'y=4', 'table', 'pair', 'pairs', 'intercept', '0', '4', '6', 'तालिका',
          'x=', 'y=', 'comma', 'put', 'substitute', 'value', 'solve', 'point', 'मान', 'हल'
        ],
        ask: { en: 'How do I easily find two points to draw the line?', hi: 'रेखा खींचने के लिए दो बिंदु आसानी से कैसे ढूँढूँ?' },
      },
      {
        id: 'points_on_line', label: { en: 'Every point on the line satisfies the equation', hi: 'उस रेखा का हर बिंदु इस समीकरण को संतुष्ट करता है' },
        keys: [
          'point', 'points', 'satisfies', 'satisfy', 'on the line', 'bindu', 'संतुष्ट', 'रेखा पर',
          'solution', 'solutions', 'lies on', 'har bindu', 'हर बिंदु'
        ],
        ask: { en: 'What does a point that lies right on the line tell us?', hi: 'जो बिंदु रेखा पर आता है उसका क्या मतलब है?' },
      },
    ],
  },
};

export const CHOTU_CONCEPTS = Object.keys(RUBRICS);
