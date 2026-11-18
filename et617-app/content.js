// Educational content for "1857 Detectives" — ET 617 · 23B1239
// Sources below are SIMPLIFIED, PARAPHRASED extracts written for Class 8 learners.

window.CONTENT = {
  roll: "23B1239",
  sessionMinutes: 10,

  agents: {
    meera: { name: "Meera", role: "Explainer", emoji: "📘", color: "#2563eb" },
    kabir: { name: "Kabir", role: "Challenger", emoji: "❓", color: "#d97706" },
    sana:  { name: "Sana",  role: "Source Checker", emoji: "🔍", color: "#059669" },
    guide: { name: "Guide", role: "Keeps things calm", emoji: "🧭", color: "#6b7280" }
  },

  // ---------- Step 1: warm-up (diagnostic, sets path) ----------
  warmup: {
    q: "Let us start easy. Why did the revolt of 1857 happen?",
    options: [
      { id: "a", text: "Only because of the greased cartridges", tag: "M1" },
      { id: "b", text: "Many reasons together — land, kingdoms, religion and the army", tag: "ok" },
      { id: "c", text: "Because the British officers wrote that it happened", tag: "M2" },
      { id: "d", text: "I am not sure yet", tag: "unsure" }
    ],
    feedback: {
      M1: "Good — you remember the cartridges! They were the spark. Today we will find the fuel that was already there.",
      ok: "Great start! You already know there were many reasons. Let us test that with real sources.",
      M2: "Interesting thought. Today we will check if writing something makes it true.",
      unsure: "That is completely fine. Not being sure is where good detectives start."
    }
  },

  // ---------- Step 2: concept explanation ----------
  concept: {
    base: [
      "Think of 1857 like a fire. 🔥",
      "**The fuel** was already there for many years:",
      "• **Political:** the British took over kingdoms. The Doctrine of Lapse took states with no son as heir. Awadh was taken in 1856.",
      "• **Economic:** farmers paid very high land tax. Weavers lost work to cheap British cloth.",
      "• **Social-religious:** many people feared they would be forced to change their religion.",
      "• **Military:** sepoys got low pay and could be sent overseas.",
      "**The spark** was the new Enfield rifle cartridges, said to be greased with cow and pig fat."
    ],
    extraForM1: [
      "Here is one way to check, Aarav-style: 🤔",
      "If cartridges were the only reason, why did **farmers, kings, queens and weavers** join? They never used rifles!",
      "So the cartridges lit the fire — but the fuel came from many groups."
    ],
    sourceIdea: "A source tells us two things: **what the writer saw** and **what the writer wanted us to believe**. So always ask: Who wrote it? When? Why?"
  },

  // ---------- Step 3: sort causes ----------
  sort: {
    categories: ["Political", "Economic", "Social-religious", "Military"],
    cards: [
      { id: "c1", text: "Kingdom of Awadh taken over (1856)", answer: "Political" },
      { id: "c2", text: "Very high land tax on farmers", answer: "Economic" },
      { id: "c3", text: "Fear of forced change of religion", answer: "Social-religious" },
      { id: "c4", text: "Greased cartridges for the new rifle", answer: "Military" },
      { id: "c5", text: "Indian weavers lose work to British cloth", answer: "Economic" },
      { id: "c6", text: "Doctrine of Lapse: no son, no kingdom", answer: "Political" }
    ],
    feedback: {
      allCorrect: "All six sorted! 🎉 Notice: only ONE card is about cartridges. The other five are the fuel.",
      someWrong: "Nice try. The cards with a yellow border can go in a better box. Hint: ask 'who was hurt by this — kings, farmers, believers or soldiers?'",
      m1Pattern: "You put many cards under Military. Kabir asks: did farmers and weavers carry rifles? Try again for those cards."
    }
  },

  // ---------- Step 4: source lab ----------
  sources: [
    {
      id: "A",
      title: "Source A — Report by a British army officer (written 1858)",
      text: "The trouble began in the army. The sepoys were afraid that the new cartridges would break their religion. Bad men spread rumours and the sepoys rose against their officers. The people in the villages were quiet and loyal to the Government.",
      author: "A British army officer",
      date: "1858, one year after the revolt",
      purposeQ: "Why might this officer say the trouble was ONLY in the army?",
      purposeOptions: [
        { id: "a", text: "It makes the British government look less to blame — only a few soldiers were angry", tag: "ok" },
        { id: "b", text: "He was an officer, so what he says must be fully true", tag: "M2" },
        { id: "c", text: "Because cartridges were the only cause", tag: "M1" }
      ],
      bestRating: "partly",
      ratingWhy: "Partly useful: it shows the army side clearly, but the officer had a reason to hide anger in villages."
    },
    {
      id: "B",
      title: "Source B — Azamgarh Proclamation (1857, simplified)",
      text: "Zamindars have been ruined by heavy land tax. Merchants have lost trade. Indian weavers and craftsmen have no work because of English goods. Our religion is not respected. All these people should join together against the English.",
      author: "Leaders of the revolt (issued in the name of the Mughal emperor)",
      date: "1857, during the revolt",
      purposeQ: "Why might the rebel leaders list so many groups?",
      purposeOptions: [
        { id: "a", text: "To get as many people as possible to join the fight", tag: "ok" },
        { id: "b", text: "It was written during the revolt, so it must be fully true", tag: "M2" },
        { id: "c", text: "To explain the cartridges", tag: "M1" }
      ],
      bestRating: "very",
      ratingWhy: "Very useful for our question: it shows why many different groups joined — but remember it was written to persuade people."
    }
  ],
  ratingQuestion: "How useful is this source for the question: Why did so many DIFFERENT people join the revolt?",
  ratingOptions: [
    { id: "not", text: "Not useful" },
    { id: "partly", text: "Partly useful" },
    { id: "very", text: "Very useful" }
  ],
  sourceFeedback: {
    ok: "Yes! You looked at WHY the writer wrote it. That is real detective work.",
    M2: "Sana says: being there does not make someone neutral. People write to protect themselves or to persuade. Try again: what did this writer WANT?",
    M1: "Meera says: this source is about more than cartridges. Read it once more — who is it talking about?"
  },

  // ---------- Step 5: agent disagreement ----------
  disagreement: {
    question: "Which cause was MOST important?",
    meera: {
      text: "I think the cartridges matter most. Source A shows the revolt started in the army, and without the spark there is no fire.",
      reliesOn: "Source A (British officer) — Sana rated: Partly useful"
    },
    sana: {
      text: "I disagree a little. Source B shows farmers, weavers and kings were already angry. The spark only worked because the fuel was there.",
      reliesOn: "Source B (Azamgarh Proclamation) — Sana rated: Very useful, but written to persuade"
    },
    guide: "Historians argue about this too. Neither view is a mistake — your reason is what matters. Pick one, or combine them.",
    choices: [
      { id: "meera", text: "I agree with Meera (cartridges most)" },
      { id: "sana",  text: "I agree with Sana (long-term causes most)" },
      { id: "both",  text: "Both — the spark AND the fuel" }
    ],
    kabirAsk: {
      meera: "Okay! One question from me: if only cartridges mattered, why did Rani Lakshmibai and farmers join? Give one reason in your own words.",
      sana:  "Okay! One question from me: if the fuel was there for years, why did the revolt start in 1857 and not earlier?",
      both:  "Okay! One question from me: which part was the spark and which part was the fuel? Say it in one line."
    },
    sentenceStarters: ["The spark was …", "The fuel was …", "I think … because Source … shows …"]
  },

  // ---------- Step 6: verdict (AI evaluated) ----------
  verdict: {
    prompt: "Your verdict, detective! In 2–3 short sentences: What were the main causes of 1857? Which source helped you most, and why?",
    starters: ["There were many causes, like …", "Source … helped me most because …", "But I should remember that the writer wanted …"],
    modelAnswer: "The revolt had many causes: kingdoms were taken (Doctrine of Lapse, Awadh), farmers paid heavy tax, weavers lost work, and people feared for their religion. The greased cartridges were only the spark. Source B helped most because it shows many groups were angry, but it was written to make people join, so I also checked Source A, which shows the army side but tries to hide anger in villages."
  },

  // Recorded sample outputs used when AI is unavailable (clearly labelled in UI)
  fallbackReplies: {
    ok: {
      meera: "Excellent! You named more than one cause and linked them. That is exactly how historians explain 1857.",
      kabir: "Strong answer. One more push: can you name ONE thing Source B might be exaggerating?",
      sana:  "You used a source AND said why the writer wrote it. That is the key skill. ⭐"
    },
    M1: {
      meera: "You are right that the cartridges were important — they were the spark. But remember the farmers, weavers and kings in Source B. Can you add one of them?",
      kabir: "If cartridges were the only reason, why would a weaver who never held a rifle join?",
      sana:  "Your answer leans on the army only. Source A also says only the army — and Source A was written by someone who wanted to say the villages were calm."
    },
    M2: {
      meera: "Good that you used a source! Now let us add WHY the writer wrote it.",
      kabir: "The officer was there — but did he have a reason to make the British look good?",
      sana:  "Being there or being an official does not make a source neutral. Ask: who wrote it, when, and what did they want people to believe?"
    },
    partial: {
      meera: "Good start! Try to name at least two different kinds of causes — like land tax and kingdoms.",
      kabir: "Which source helped you most? Tell me its letter and one reason.",
      sana:  "Add one line about the writer's purpose and your answer will be complete."
    }
  }
};
