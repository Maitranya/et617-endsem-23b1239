// /api/agents — Vercel serverless function. ET 617 · 23B1239
// Two chained AI calls so agents exchange information:
//   1) Sana (Source Checker) evaluates the learner's verdict -> writes notes
//   2) Meera (Explainer) + Kabir (Challenger) read Sana's notes and reply
// Every AI output is validated before the learner sees it; on any failure we
// return the rule-based tutor + recorded sample replies (labelled as fallback).
//
// Env vars (set in Vercel, never committed):
//   GEMINI_API_KEY  (+ optional GEMINI_MODEL, default gemini-2.5-flash)
//   or OPENAI_API_KEY (+ optional OPENAI_MODEL, default gpt-4o-mini,
//                      optional OPENAI_BASE_URL for OpenAI-compatible APIs e.g. Groq)

const ALLOWED_YEARS = ["1848", "1853", "1856", "1857", "1858"];
const BANNED = ["wrong", "stupid", "fail", "bad answer", "incorrect", "lazy", "silly"];
const MISC = ["M1", "M2", "partial", "ok"];

// ---------------- Rule-based tutor (fallback + safety cross-check) ----------------
function ruleClassify(text) {
  const t = (text || "").toLowerCase();
  const has = (arr) => arr.some((w) => t.includes(w));
  const cats = {
    military: has(["cartridge", "grease", "rifle", "sepoy", "army", "soldier", "pay"]),
    political: has(["kingdom", "lapse", "awadh", "annex", "king", "rani", "ruler", "state"]),
    economic: has(["tax", "land", "farmer", "weaver", "trade", "merchant", "artisan", "cloth", "zamindar", "money"]),
    religious: has(["religion", "religious", "convert", "faith", "belief", "caste"])
  };
  const nCats = Object.values(cats).filter(Boolean).length;
  const usesSource = /source\s*[ab]\b|proclamation|officer|report/.test(t);
  const purpose = has(["want", "purpose", "persuade", "bias", "biased", "hide", "make people join", "propaganda", "exaggerat", "point of view", "reason to"]);
  const authorityTrust = has(["must be true", "so it is true", "he was there", "was there so", "official so", "eyewitness so", "cannot lie", "can't lie", "is true because"]);

  let misconception = "partial";
  if (authorityTrust && !purpose) misconception = "M2";
  else if (cats.military && nCats === 1) misconception = "M1";
  else if (nCats >= 2 && usesSource && purpose) misconception = "ok";
  else if (nCats >= 2 && usesSource) misconception = "partial";

  const score = misconception === "ok" ? 2 : misconception === "partial" ? 1 : 0;
  return { misconception, score, causesFound: cats, usesSource, purpose };
}

// ---------------- Prompts ----------------
const CONTEXT = `Topic: causes of the 1857 revolt (Class 8, India). Facts you may use: Doctrine of Lapse; annexation of Awadh in 1856; heavy land revenue on farmers; weavers ruined by British cloth; fear of religious conversion; low sepoy pay; Enfield rifle cartridges rumoured to be greased with cow and pig fat (the spark).
Source A: report by a British army officer (1858) saying the trouble was only in the army and villages were loyal (purpose: make the government look less to blame).
Source B: Azamgarh Proclamation (1857, simplified) listing zamindars, merchants, artisans and religion as grievances (purpose: persuade many groups to join).
Learner: Aarav, 13, repeating the topic after failing, very anxious. Use short simple sentences (max 2 sentences, under 45 words). Never use the words wrong, incorrect, fail. Do not give the full model answer.
Known misconceptions: M1 = "only the cartridges caused it"; M2 = "an official or eyewitness source must be true".`;

function sanaPrompt(answer, state) {
  return `${CONTEXT}
You are SANA, the Source Checker agent. Evaluate the learner's verdict below.
Classify it: "ok" (2+ kinds of causes AND uses a source AND mentions the writer's purpose/bias), "partial" (some but not all), "M1", or "M2".
Earlier in the session: warm-up tag=${state.warmupTag || "none"}, chose in disagreement=${state.choice || "none"}.
Learner verdict: """${String(answer).slice(0, 800)}"""
Reply ONLY as JSON: {"misconception":"ok|partial|M1|M2","score":0|1|2,"evidence_note":"one short line for the other agents about what evidence the learner used or missed","sana":"your feedback to the learner"}`;
}

function teamPrompt(answer, sana) {
  return `${CONTEXT}
Team notes from SANA (Source Checker): classification=${sana.misconception}; note="${sana.evidence_note}".
Learner verdict: """${String(answer).slice(0, 800)}"""
Write two replies that build on Sana's notes and do NOT contradict her classification:
- MEERA, the Explainer: warm, explains one missing idea or praises one correct link.
- KABIR, the Challenger: asks ONE "why" question that pushes the learner's reasoning. He never gives the answer.
Reply ONLY as JSON: {"meera":"...","kabir":"..."}`;
}

// ---------------- LLM call ----------------
async function callLLM(prompt) {
  if (process.env.GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" }
        })
      }
    );
    if (!r.ok) throw new Error("Gemini HTTP " + r.status);
    const j = await r.json();
    return JSON.parse(j.candidates[0].content.parts[0].text);
  }
  if (process.env.OPENAI_API_KEY) {
    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) throw new Error("OpenAI HTTP " + r.status);
    const j = await r.json();
    return JSON.parse(j.choices[0].message.content);
  }
  throw new Error("No API key configured");
}

// ---------------- Validation (before learner sees anything) ----------------
function checkText(s) {
  if (typeof s !== "string") return "not text";
  const t = s.trim();
  if (t.length < 5 || t.length > 350) return "length";
  const low = t.toLowerCase();
  if (BANNED.some((w) => low.includes(w))) return "tone";
  const years = t.match(/\b1[0-9]{3}\b/g) || [];
  if (years.some((y) => !ALLOWED_YEARS.includes(y))) return "unknown date";
  return null;
}

// ---------------- Handler ----------------
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const answer = (body && body.answer) || "";
  const state = (body && body.state) || {};
  const FALLBACK = require("./fallback.json");

  const rule = ruleClassify(answer);
  const log = [];

  try {
    // Agent 1: Sana
    const sana = await callLLM(sanaPrompt(answer, state));
    if (!MISC.includes(sana.misconception)) throw new Error("bad classification");
    const e1 = checkText(sana.sana) || checkText(sana.evidence_note);
    if (e1) throw new Error("Sana output failed check: " + e1);
    log.push("Sana -> notes: " + sana.evidence_note);

    // Safety cross-check: if AI says "ok" but rules find a clear misconception, trust the rules
    let finalMisc = sana.misconception;
    if (sana.misconception === "ok" && (rule.misconception === "M1" || rule.misconception === "M2")) {
      finalMisc = rule.misconception;
      log.push("Guide: AI said ok but rule check found " + rule.misconception + " -> using rule result");
    }

    // Agents 2 & 3: Meera + Kabir read Sana's notes
    const team = await callLLM(teamPrompt(answer, { ...sana, misconception: finalMisc }));
    const e2 = checkText(team.meera) || checkText(team.kabir);
    if (e2) throw new Error("Team output failed check: " + e2);
    if (!team.kabir.includes("?")) throw new Error("Kabir must ask a question");
    log.push("Meera + Kabir read Sana's notes and replied");

    const usedSana = finalMisc === sana.misconception ? sana.sana : FALLBACK[finalMisc].sana;
    return res.status(200).json({
      source: "ai",
      misconception: finalMisc,
      score: finalMisc === "ok" ? 2 : finalMisc === "partial" ? 1 : 0,
      replies: { sana: usedSana, meera: team.meera, kabir: team.kabir },
      teamNotes: log,
      rule
    });
  } catch (err) {
    const fb = FALLBACK[rule.misconception];
    return res.status(200).json({
      source: "fallback",
      reason: String(err.message || err),
      misconception: rule.misconception,
      score: rule.score,
      replies: fb,
      teamNotes: ["AI unavailable (" + String(err.message || err) + ") -> rule-based tutor + recorded sample replies"],
      rule
    });
  }
};

module.exports.ruleClassify = ruleClassify;
module.exports.checkText = checkText;
