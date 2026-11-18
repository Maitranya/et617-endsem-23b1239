# DESIGN.md — ET 617 End-Sem · 23B1239

## Exam card
| Field | Choice |
|---|---|
| P | **P3 – Multi-agent collaborative learning environment** |
| T | **P3-T5 – Causes of the 1857 revolt: weighing sources (Class 8)** |
| L | **L5 – Learner repeating the topic after failing once; high anxiety, low self-efficacy** |
| C | **C4 – 10-minute sessions (one full sequence in ≤10 min; stop and resume)** |
| ID | **23B1239** |

App name: **"1857 Detectives"** — three AI helpers work with the learner like a small study group.

---

## D1 – Educational problem
Class 8 learners usually memorise "the greased cartridges caused the revolt of 1857" and fail questions that ask them to explain *several* causes or to judge *which source to trust*. History is taught as facts to learn, not evidence to weigh, so learners cannot compare a British report with an Indian proclamation. A learner who has already failed this chapter also feels anxious and avoids open-ended answers. We need a short, low-pressure activity where the learner reads simple source extracts, hears different views, and makes and defends their own judgement.

**Learning outcomes** (measurable)
- **LO1 – Explain** at least three causes of the 1857 revolt and **classify** them as political, economic, social-religious or military.
- **LO2 – Evaluate** the reliability of a source by identifying its author, date and purpose (and so its likely bias).
- **LO3 – Compare** two sources that disagree and **justify** a conclusion about the causes using evidence from both.

**Context of use:** at home in the evening (or a school computer-lab period), on a mother's Android phone or a lab desktop, in one sitting of about 10 minutes; can pause and continue the next day.

## D2 – Learner persona
**Aarav Shinde, 13, Class 8, Marathi-medium municipal school in Pune (studies History in English as a second subject at a coaching class).**
- **Situation:** failed the Class 8 History unit test on "1857" last term (got 6/20). Repeating the chapter before the re-test.
- **Prior knowledge:** knows the British East India Company ruled large parts of India; knows the words "sepoy", "Mangal Pandey", "cartridges". Can read short English paragraphs; long ones tire him. Has never been taught how to judge a source.
- **Misconception M1 (single cause):** "The revolt happened only because of the greased cartridges."
- **Misconception M2 (source authority):** "If a source was written by an official or by someone who was there, it must be true."
- **Device & time:** mother's Android phone (or lab PC), ~10 minutes after dinner; sometimes interrupted.
- **Language:** Marathi at home; reads simple English; short sentences needed.
- **Motivation:** wants to pass the re-test and stop feeling "bad at History". Gives up quickly if he sees red crosses or the word "wrong". Likes being asked his opinion.

## D3 – Content plan (one complete learning activity)
**Concept explanation (Explainer):** the revolt had many causes that joined together — political (Doctrine of Lapse, annexation of Awadh 1856), economic (heavy land revenue, ruined weavers and artisans), social-religious (fear of forced conversion, new laws), military (low pay, overseas service, Enfield rifle cartridges as the *spark*). A source tells us what its author saw *and* wanted us to believe.

**Tasks (6 tasks, 4 formats)**
1. **Warm-up MCQ (diagnostic):** "Why did the revolt of 1857 happen?" — sets the starting path (profile adaptivity).
2. **Classify causes (sorting):** 6 cause cards → Political / Economic / Social-religious / Military.
3. **Source check (MCQ ×2):** for Source A (British officer's report, 1858) and Source B (Azamgarh Proclamation, 1857, simplified) — "Why might this author write this?"
4. **Rate reliability (scale):** rate each source "Not useful / Partly useful / Very useful" for the question *why did so many different people join?*
5. **Agent disagreement → choose (decision):** Explainer and Evaluator disagree; learner sides with one or combines.
6. **Your verdict (free text, AI-evaluated):** "In 2–3 sentences: what were the main causes, and which source helped you most and why?"

Model answers, correct feedback, and M1/M2 feedback for every task are in `content.js`.

## Agents (P3)
| Agent | Role | Reads from shared notes | Writes to shared notes |
|---|---|---|---|
| **Meera – Explainer** | Explains causes, gives context, simplifies | Sana's source ratings; learner's sort results | which causes the learner still misses |
| **Kabir – Challenger** | Asks "why?", tests reasoning, never gives answers | learner's answers + Meera's claim | the question the learner must answer |
| **Sana – Source Evaluator** | Checks author/date/purpose, rates evidence, gives feedback on learner's evidence | sources; learner's verdict | reliability ratings; misconception detected |
| *Guide (moderator, not a teaching agent)* | Applies the conflict rule, keeps tone calm | all notes | which view is shown, when |

Agents exchange information through a visible **"Team notes"** panel (shared blackboard).

## Design challenge – conflicting advice vs learner agency
- Agents may disagree only about **interpretation** (how important a cause is, how far to trust a source), never about **facts** (facts checked against a fixed fact bank).
- At most **one disagreement per screen**, shown as a "Two views" card side by side, each labelled with *what evidence it relies on* and that source's reliability rating.
- The Guide frames it as "Historians argue about this too — your reasoning decides."
- The learner chooses: **side with Meera / side with Sana / combine both**, then Kabir asks for one reason. No choice is marked wrong; the reason is what gets feedback.

## C4 – 10-minute session
Visible 10-minute progress bar and step counter (6 steps ≈ 1.5 min each); autosave to the device after every step; "Pause & save" button; Welcome screen offers "Continue where you left off".

## Adaptivity
- **Profile:** warm-up answer → single-cause learners get an extra "many causes" explanation first.
- **Performance:** misconception detected → targeted feedback + a simpler retry with sentence starters.
- **Interaction:** hint count and time per step are logged; after 2 hints Meera gives a worked example.

## Screens
Welcome/Resume → Warm-up → Meet the team (concept) → Sort causes → Source lab → Two views (disagreement) → Your verdict (AI) → Summary · About. Footer on every screen: **23B1239**.

## AI plan
Serverless function `/api/agents` calls an LLM (key stored only as a Vercel env var) to produce the three agents' replies to the learner's free-text verdict, as strict JSON. Output is validated (schema, length, tone words, allowed dates). If the call fails or validation fails → clearly labelled fallback: rule-based classifier + recorded sample responses.
