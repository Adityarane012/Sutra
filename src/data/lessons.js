// 2-minute micro-lessons. Each concept can be taught three ways; if a student
// still misses after one style, Sutra switches to the next one.
// `visual` = number line / picture style, `example` = worked example,
// `story` = everyday Indian context. `reteach` = the 10-minute idea shown to
// the teacher in the morning brief.

export const LESSON_STYLES = ['visual', 'example', 'story'];

export const LESSONS = {
  c6_int: {
    numberLine: true,
    visual: {
      en: ['Numbers to the right of 0 are positive. Numbers to the left of 0 are negative.', 'The further RIGHT a number is, the BIGGER it is.', 'So 2 > −3, and −2 > −5, because −2 is closer to the right.'],
      hi: ['0 के दाईं ओर की संख्याएँ धनात्मक हैं। 0 के बाईं ओर की संख्याएँ ऋणात्मक हैं।', 'जो संख्या जितनी ज़्यादा दाईं ओर, वह उतनी बड़ी।', 'इसलिए 2 > −3, और −2 > −5, क्योंकि −2 ज़्यादा दाईं ओर है।'],
    },
    example: {
      en: ['Compare −7 and −1.', 'Mark both on the number line: −7 is 7 steps left of 0, −1 is just 1 step left.', '−1 is further right, so −1 > −7.'],
      hi: ['−7 और −1 की तुलना कीजिए।', 'दोनों को संख्या रेखा पर रखिए: −7, 0 से 7 कदम बाईं ओर है, −1 सिर्फ 1 कदम।', '−1 ज़्यादा दाईं ओर है, इसलिए −1 > −7।'],
    },
    story: {
      en: ['Think of money. +₹50 means you have ₹50. −₹50 means you owe the kirana shop ₹50.', 'Owing ₹80 (−80) is worse than owing ₹20 (−20).', 'So −80 < −20. Bigger debt = smaller number.'],
      hi: ['पैसों के बारे में सोचिए। +₹50 मतलब आपके पास ₹50 हैं। −₹50 मतलब आप पर किराना दुकान का ₹50 कर्ज़ है।', '₹80 का कर्ज़ (−80), ₹20 के कर्ज़ (−20) से बुरा है।', 'इसलिए −80 < −20। बड़ा कर्ज़ = छोटी संख्या।'],
    },
    reteach: {
      en: 'Draw a chalk number line on the floor from −10 to 10. Call out pairs (−3 and 2, −7 and −1); students walk to each and say which is further right.',
      hi: 'फ़र्श पर −10 से 10 तक चॉक से संख्या रेखा बनाइए। जोड़ियाँ बोलिए (−3 और 2, −7 और −1); छात्र चलकर बताएँ कि कौन ज़्यादा दाईं ओर है।',
    },
  },
  c6_frac: {
    visual: {
      en: ['A fraction is a part of a whole. The bottom number says how many equal pieces. The top says how many you take.', 'More pieces means each piece is smaller.', 'So 1/8 < 1/4.'],
      hi: ['भिन्न पूरे का एक भाग है। नीचे की संख्या बताती है कितने बराबर टुकड़े। ऊपर की बताती है कितने लिए।', 'ज़्यादा टुकड़े मतलब हर टुकड़ा छोटा।', 'इसलिए 1/8 < 1/4।'],
    },
    example: {
      en: ['Make 2/3 into twelfths.', '3 × 4 = 12, so multiply top AND bottom by 4.', '2/3 = 8/12. Same amount, smaller pieces.'],
      hi: ['2/3 को बारहवें भाग में बदलिए।', '3 × 4 = 12, तो अंश और हर दोनों को 4 से गुणा कीजिए।', '2/3 = 8/12। मात्रा वही, टुकड़े छोटे।'],
    },
    story: {
      en: ['One roti shared by 4 friends: each gets 1/4.', 'The same roti shared by 8 friends: each gets 1/8.', 'Who gets more? The group of 4. So 1/4 > 1/8.'],
      hi: ['एक रोटी 4 दोस्तों में बँटी: हर एक को 1/4।', 'वही रोटी 8 दोस्तों में बँटी: हर एक को 1/8।', 'किसे ज़्यादा मिला? 4 वाले समूह को। इसलिए 1/4 > 1/8।'],
    },
    reteach: {
      en: 'Fold paper strips into halves, quarters and eighths. Students line them up to compare 1/4 and 1/8, then 3/5 and 3/7.',
      hi: 'कागज़ की पट्टियों को आधे, चौथाई और आठवें भाग में मोड़िए। छात्र उन्हें मिलाकर 1/4 और 1/8, फिर 3/5 और 3/7 की तुलना करें।',
    },
  },
  c6_var: {
    visual: {
      en: ['A letter like x stands for a number we don’t know yet.', '2x means 2 × x. Not “2 and x”.', 'If x = 3, then 2x = 2 × 3 = 6.'],
      hi: ['x जैसा अक्षर उस संख्या के लिए है जो हमें अभी नहीं पता।', '2x का मतलब 2 × x है। “2 और x” नहीं।', 'अगर x = 3, तो 2x = 2 × 3 = 6।'],
    },
    example: {
      en: ['Find 3a + 1 when a = 4.', 'Replace a with 4: 3 × 4 + 1.', '12 + 1 = 13.'],
      hi: ['a = 4 हो तो 3a + 1 निकालिए।', 'a की जगह 4 रखिए: 3 × 4 + 1।', '12 + 1 = 13।'],
    },
    story: {
      en: ['A samosa costs ₹y. You buy 5.', 'You pay y + y + y + y + y = 5 × y = 5y.', 'If a samosa costs ₹12, you pay 5 × 12 = ₹60.'],
      hi: ['एक समोसा ₹y का है। आपने 5 लिए।', 'आपने दिए y + y + y + y + y = 5 × y = 5y।', 'अगर समोसा ₹12 का है, तो 5 × 12 = ₹60।'],
    },
    reteach: {
      en: 'Write “2x” on the board and ask three students for x = 1, 5, 10. Show 2x = 2 × x each time, never “2 then x”.',
      hi: 'बोर्ड पर “2x” लिखिए और तीन छात्रों से x = 1, 5, 10 के लिए पूछिए। हर बार दिखाइए 2x = 2 × x, “2 फिर x” नहीं।',
    },
  },
  c7_intops: {
    numberLine: true,
    visual: {
      en: ['Adding a positive: move RIGHT. Subtracting a positive: move LEFT.', 'Subtracting a negative is the same as adding: 4 − (−3) = 4 + 3 = 7.', '−5 + 3: start at −5, move 3 right → −2.'],
      hi: ['धन जोड़ना: दाईं ओर चलिए। धन घटाना: बाईं ओर चलिए।', 'ऋण को घटाना = जोड़ना: 4 − (−3) = 4 + 3 = 7।', '−5 + 3: −5 से शुरू करके 3 दाईं ओर → −2।'],
    },
    example: {
      en: ['Work out (−6) − (−10).', 'Change “− (−10)” to “+ 10”: −6 + 10.', 'Start at −6, move 10 right → 4.'],
      hi: ['(−6) − (−10) निकालिए।', '“− (−10)” को “+ 10” बनाइए: −6 + 10।', '−6 से शुरू करके 10 दाईं ओर → 4।'],
    },
    story: {
      en: ['You owe your friend ₹3 (−3). She says “forget it” and takes the debt away.', 'Taking away −3 makes you ₹3 better off.', 'So 4 − (−3) = 7.'],
      hi: ['आप पर दोस्त का ₹3 कर्ज़ है (−3)। वह कहती है “छोड़ो” और कर्ज़ हटा देती है।', '−3 हटाने से आप ₹3 बेहतर हो जाते हैं।', 'इसलिए 4 − (−3) = 7।'],
    },
    reteach: {
      en: 'Use the floor number line: students take steps for −5 + 3 and 4 − (−3). Turning around for “minus a negative” makes the rule stick.',
      hi: 'फ़र्श की संख्या रेखा पर छात्र −5 + 3 और 4 − (−3) के कदम चलें। “ऋण का घटाना” के लिए मुड़ जाना नियम याद कराता है।',
    },
  },
  c7_intmul: {
    visual: {
      en: ['Same signs → positive answer. Different signs → negative answer.', '(−3) × (−4) = +12. (−5) × 4 = −20.', 'Division follows the same rule: (−18) ÷ 3 = −6.'],
      hi: ['एक जैसे चिह्न → धन उत्तर। अलग चिह्न → ऋण उत्तर।', '(−3) × (−4) = +12। (−5) × 4 = −20।', 'भाग में भी यही नियम: (−18) ÷ 3 = −6।'],
    },
    example: {
      en: ['Look at the pattern: 3 × (−2) = −6, 2 × (−2) = −4, 1 × (−2) = −2, 0 × (−2) = 0.', 'Each step adds 2. Keep going: (−1) × (−2) = 2.', 'That is why negative × negative is positive.'],
      hi: ['पैटर्न देखिए: 3 × (−2) = −6, 2 × (−2) = −4, 1 × (−2) = −2, 0 × (−2) = 0।', 'हर कदम पर 2 बढ़ता है। आगे: (−1) × (−2) = 2।', 'इसीलिए ऋण × ऋण = धन।'],
    },
    story: {
      en: ['You lose ₹5 every day (−5). After 4 days: 4 × (−5) = −₹20.', 'Going back in time 4 days (−4): you had ₹20 more.', 'So (−4) × (−5) = +20.'],
      hi: ['आप हर दिन ₹5 खोते हैं (−5)। 4 दिन बाद: 4 × (−5) = −₹20।', '4 दिन पीछे जाएँ (−4): आपके पास ₹20 ज़्यादा थे।', 'इसलिए (−4) × (−5) = +20।'],
    },
    reteach: {
      en: 'Write the 3 × (−2), 2 × (−2), 1 × (−2) pattern on the board and let the class continue it past zero.',
      hi: 'बोर्ड पर 3 × (−2), 2 × (−2), 1 × (−2) का पैटर्न लिखिए और कक्षा को शून्य के पार जारी रखने दीजिए।',
    },
  },
  c7_fracops: {
    visual: {
      en: ['To add fractions, the pieces must be the same size.', 'Make the bottoms equal first: 1/2 + 1/3 = 3/6 + 2/6.', 'Then add the tops: 5/6.'],
      hi: ['भिन्न जोड़ने के लिए टुकड़े बराबर आकार के होने चाहिए।', 'पहले हर बराबर कीजिए: 1/2 + 1/3 = 3/6 + 2/6।', 'फिर अंश जोड़िए: 5/6।'],
    },
    example: {
      en: ['Work out 3/4 − 1/2.', '1/2 = 2/4, so 3/4 − 2/4.', '= 1/4.'],
      hi: ['3/4 − 1/2 निकालिए।', '1/2 = 2/4, तो 3/4 − 2/4।', '= 1/4।'],
    },
    story: {
      en: ['Half a pizza plus a third of a pizza.', 'Cut the pizza into 6 slices: half is 3 slices, a third is 2 slices.', '3 + 2 = 5 slices out of 6 = 5/6. Not 2/5!'],
      hi: ['आधा पिज़्ज़ा और एक तिहाई पिज़्ज़ा।', 'पिज़्ज़ा के 6 टुकड़े कीजिए: आधा = 3 टुकड़े, एक तिहाई = 2 टुकड़े।', '3 + 2 = 6 में से 5 = 5/6। 2/5 नहीं!'],
    },
    reteach: {
      en: 'Show 1/2 + 1/3 with paper circles cut into sixths. Ask: can 2/5 be right if 1/2 alone is already bigger than 2/5?',
      hi: 'छठे भाग में कटे कागज़ के गोलों से 1/2 + 1/3 दिखाइए। पूछिए: अगर अकेला 1/2 ही 2/5 से बड़ा है, तो 2/5 सही कैसे?',
    },
  },
  c7_expr: {
    visual: {
      en: ['Like terms have the same letter: 5x and −7x. Unlike terms do not: 2x and 3y.', 'Combine like terms by adding their numbers, keeping the sign: 5x − 7x = −2x.', 'Unlike terms stay separate: 2x + 3y cannot be simplified.'],
      hi: ['समान पदों में एक ही अक्षर होता है: 5x और −7x। असमान में नहीं: 2x और 3y।', 'समान पद मिलाने के लिए संख्याएँ जोड़िए, चिह्न के साथ: 5x − 7x = −2x।', 'असमान पद अलग रहते हैं: 2x + 3y सरल नहीं होता।'],
    },
    example: {
      en: ['Simplify 3a + 4b − a + 2b.', 'a terms: 3a − a = 2a. b terms: 4b + 2b = 6b.', 'Answer: 2a + 6b.'],
      hi: ['3a + 4b − a + 2b सरल कीजिए।', 'a पद: 3a − a = 2a। b पद: 4b + 2b = 6b।', 'उत्तर: 2a + 6b।'],
    },
    story: {
      en: ['x = mangoes, y = bananas. You have 2 mangoes and 3 bananas: 2x + 3y.', 'That is not 5 “mango-bananas”.', 'But 5 mangoes, then 7 mangoes eaten: 5x − 7x = −2x (you owe 2 mangoes!).'],
      hi: ['x = आम, y = केले। आपके पास 2 आम और 3 केले: 2x + 3y।', 'ये 5 “आम-केले” नहीं हैं।', 'पर 5 आम थे, 7 खा लिए: 5x − 7x = −2x (2 आम उधार!)।'],
    },
    reteach: {
      en: 'Sort cards (3x, −2y, 5, −x, 4y) into groups of like terms on the board, then combine each group aloud.',
      hi: 'कार्ड (3x, −2y, 5, −x, 4y) को बोर्ड पर समान पदों के समूहों में बाँटिए, फिर हर समूह को बोलकर मिलाइए।',
    },
  },
  c7_simpleeq: {
    visual: {
      en: ['An equation is a balance. Whatever you do to one side, do to the other.', 'x + 5 = 2 → subtract 5 from both sides → x = −3.', 'A term that crosses “=” changes its sign.'],
      hi: ['समीकरण एक तराज़ू है। एक तरफ़ जो करें, दूसरी तरफ़ भी वही करें।', 'x + 5 = 2 → दोनों तरफ़ से 5 घटाइए → x = −3।', '“=” पार करने वाला पद अपना चिह्न बदलता है।'],
    },
    example: {
      en: ['Solve 2x − 4 = 10.', 'Add 4 to both sides: 2x = 14.', 'Divide both sides by 2: x = 7.'],
      hi: ['2x − 4 = 10 हल कीजिए।', 'दोनों तरफ़ 4 जोड़िए: 2x = 14।', 'दोनों तरफ़ 2 से भाग: x = 7।'],
    },
    story: {
      en: ['Riya’s money plus ₹5 is ₹2... she must owe money!', 'x + 5 = 2 means x = 2 − 5 = −3.', 'Check: −3 + 5 = 2 ✓'],
      hi: ['रिया के पैसे + ₹5 = ₹2... मतलब उस पर कर्ज़ है!', 'x + 5 = 2 मतलब x = 2 − 5 = −3।', 'जाँच: −3 + 5 = 2 ✓'],
    },
    reteach: {
      en: 'Use a drawn balance scale. Students “remove 5 from both pans” for x + 5 = 2 and say the new sign aloud.',
      hi: 'तराज़ू का चित्र बनाइए। x + 5 = 2 के लिए छात्र “दोनों पलड़ों से 5 हटाएँ” और नया चिह्न बोलें।',
    },
  },
  c8_lineq: {
    visual: {
      en: ['Same balance rule as simple equations, just more steps.', 'First collect x terms on one side and numbers on the other.', 'Clear fractions by multiplying EVERY term by the bottom number.'],
      hi: ['सरल समीकरणों वाला तराज़ू नियम, बस ज़्यादा कदम।', 'पहले x वाले पद एक तरफ़, संख्याएँ दूसरी तरफ़।', 'भिन्न हटाने के लिए हर पद को हर से गुणा कीजिए।'],
    },
    example: {
      en: ['Solve 3x − 7 = −1.', 'Add 7 to both sides: 3x = 6.', 'Divide by 3: x = 2. Check: 3(2) − 7 = −1 ✓'],
      hi: ['3x − 7 = −1 हल कीजिए।', 'दोनों तरफ़ 7 जोड़िए: 3x = 6।', '3 से भाग: x = 2। जाँच: 3(2) − 7 = −1 ✓'],
    },
    story: {
      en: ['A cricket team scored x runs. After a 7-run penalty they have −1 net runs on the board.', 'x − 7 = −1 → x = 6 runs.', 'Undo the penalty by adding it back.'],
      hi: ['एक क्रिकेट टीम ने x रन बनाए। 7 रन की पेनल्टी के बाद बोर्ड पर −1 है।', 'x − 7 = −1 → x = 6 रन।', 'पेनल्टी वापस जोड़कर हटाइए।'],
    },
    reteach: {
      en: 'Solve 3x − 7 = −1 together, then ask students to check by putting x back in. Checking catches sign slips.',
      hi: '3x − 7 = −1 साथ में हल कीजिए, फिर छात्र x वापस रखकर जाँचें। जाँच से चिह्न की गलतियाँ पकड़ में आती हैं।',
    },
  },
  c8_brackets: {
    visual: {
      en: ['The number outside multiplies EVERY term inside.', '3(x + 2) = 3·x + 3·2 = 3x + 6.', 'Watch signs: −2(x − 3) = −2x + 6.'],
      hi: ['बाहर की संख्या अंदर के हर पद से गुणा होती है।', '3(x + 2) = 3·x + 3·2 = 3x + 6।', 'चिह्न देखिए: −2(x − 3) = −2x + 6।'],
    },
    example: {
      en: ['Simplify 4(2a − 1) − 3a.', 'Open the bracket: 8a − 4 − 3a.', 'Combine: 5a − 4.'],
      hi: ['4(2a − 1) − 3a सरल कीजिए।', 'कोष्ठक खोलिए: 8a − 4 − 3a।', 'मिलाइए: 5a − 4।'],
    },
    story: {
      en: ['3 friends each buy a pen (₹x) and a ₹2 eraser.', 'Total = 3 × (x + 2). Each friend pays for BOTH items.', 'So 3x + 6, not 3x + 2.'],
      hi: ['3 दोस्त हर एक पेन (₹x) और ₹2 की रबर लेते हैं।', 'कुल = 3 × (x + 2)। हर दोस्त दोनों चीज़ों के पैसे देता है।', 'तो 3x + 6, 3x + 2 नहीं।'],
    },
    reteach: {
      en: 'Draw arrows from the outside number to every term inside the bracket. Students draw the arrows before writing the answer.',
      hi: 'बाहर की संख्या से कोष्ठक के हर पद तक तीर बनाइए। उत्तर लिखने से पहले छात्र तीर बनाएँ।',
    },
  },
  c9_poly: {
    visual: {
      en: ['p(−2) means: put −2 in place of x.', 'Always keep the brackets: x² becomes (−2)² = 4, not −4.', 'Then work out the rest.'],
      hi: ['p(−2) मतलब: x की जगह −2 रखिए।', 'हमेशा कोष्ठक रखिए: x² बनता है (−2)² = 4, −4 नहीं।', 'फिर बाकी निकालिए।'],
    },
    example: {
      en: ['p(x) = 3x − 7. Find p(−2).', '3 × (−2) − 7 = −6 − 7.', '= −13.'],
      hi: ['p(x) = 3x − 7। p(−2) निकालिए।', '3 × (−2) − 7 = −6 − 7।', '= −13।'],
    },
    story: {
      en: ['A polynomial is a machine. You drop a number in, it gives a number out.', 'p(x) = x² − 3. Drop in −2: (−2)² − 3 = 4 − 3 = 1.', 'The machine always uses brackets around what you drop in.'],
      hi: ['बहुपद एक मशीन है। आप संख्या डालते हैं, वह संख्या देती है।', 'p(x) = x² − 3। −2 डालिए: (−2)² − 3 = 4 − 3 = 1।', 'मशीन हमेशा डाली गई संख्या को कोष्ठक में रखती है।'],
    },
    reteach: {
      en: 'Do a “function machine” on the board: students call out inputs, the class computes outputs with brackets.',
      hi: 'बोर्ड पर “फ़ंक्शन मशीन” बनाइए: छात्र इनपुट बोलें, कक्षा कोष्ठक के साथ आउटपुट निकाले।',
    },
  },
  c9_lin2: {
    visual: {
      en: ['A linear equation in two variables has many solutions: each is a point (x, y) on a line.', 'To find one, fix one variable and solve for the other.', 'Careful with negatives: if y = −1, then −y = +1.'],
      hi: ['दो चर वाले रैखिक समीकरण के कई हल होते हैं: हर हल रेखा पर एक बिंदु (x, y) है।', 'एक हल निकालने के लिए एक चर तय कीजिए और दूसरा निकालिए।', 'ऋण से सावधान: अगर y = −1, तो −y = +1।'],
    },
    example: {
      en: ['3x − y = 7, y = −1.', '3x − (−1) = 7 → 3x + 1 = 7.', '3x = 6 → x = 2. Point: (2, −1).'],
      hi: ['3x − y = 7, y = −1।', '3x − (−1) = 7 → 3x + 1 = 7।', '3x = 6 → x = 2। बिंदु: (2, −1)।'],
    },
    story: {
      en: ['A notebook costs ₹x and a pen ₹y. 3 notebooks cost ₹7 more than a pen: 3x − y = 7.', 'Many price pairs fit. If a pen costs ₹2: 3x − 2 = 7, so x = 3.', 'Pick one price, and the other one is fixed. Each pair is a point on the line.'],
      hi: ['एक कॉपी ₹x की और एक पेन ₹y का। 3 कॉपियाँ पेन से ₹7 महँगी हैं: 3x − y = 7।', 'कई जोड़ियाँ फ़िट होती हैं। अगर पेन ₹2 का है: 3x − 2 = 7, तो x = 3।', 'एक कीमत चुनिए, दूसरी तय हो जाती है। हर जोड़ी रेखा पर एक बिंदु है।'],
    },
    reteach: {
      en: 'Give each row a different y value for 3x − y = 7; rows solve for x and plot their point. The points line up.',
      hi: '3x − y = 7 के लिए हर पंक्ति को अलग y दीजिए; पंक्तियाँ x निकालें और बिंदु बनाएँ। बिंदु एक रेखा में आएँगे।',
    },
  },
};
