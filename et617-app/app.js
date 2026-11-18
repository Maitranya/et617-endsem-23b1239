// 1857 Detectives — ET 617 End-Sem · 23B1239 · P3-T5-L5-C4
(function () {
  const C = window.CONTENT;
  const KEY = "et617_23B1239_session";
  const STEPS = ["warmup", "concept", "sort", "sourceA", "sourceB", "disagree", "verdict"];
  const STEP_NUM = { warmup: 1, concept: 2, sort: 3, sourceA: 4, sourceB: 4, disagree: 5, verdict: 6, summary: 6 };
  const app = document.getElementById("app");

  // ---------------- state + autosave (C4) ----------------
  const fresh = () => ({
    step: "welcome", elapsed: 0, warmupTag: null, sort: {}, sortAttempts: 0,
    sources: { A: {}, B: {} }, choice: null, kabirReply: "", verdicts: [], result: null,
    hints: 0, stepTimes: {}, misconceptions: [], notes: [], startedAt: null, lastStep: null
  });
  let S = load() || fresh();
  let paused = false;

  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
  function go(step) {
    S.step = step;
    if (STEPS.includes(step)) S.lastStep = step;
    save(); render(); window.scrollTo(0, 0);
  }
  function note(msg) {
    S.notes.push(msg); save(); renderNotes();
  }
  function flagMisc(tag, where) {
    if (tag === "M1" || tag === "M2") { S.misconceptions.push(tag + " @ " + where); save(); }
  }

  // timer: counts only while learning
  setInterval(() => {
    if (paused || !STEPS.includes(S.step)) return;
    S.elapsed++; S.stepTimes[S.step] = (S.stepTimes[S.step] || 0) + 1;
    if (S.elapsed % 5 === 0) save();
    renderSession();
  }, 1000);

  // ---------------- helpers ----------------
  const md = (s) => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  function agent(id, msg, extra = "") {
    const a = C.agents[id];
    return `<div class="agent" style="--c:${a.color}"><div class="avatar">${a.emoji}</div>
      <div><div class="who">${a.name} · ${a.role}</div><div class="msg">${md(esc(msg))}</div>${extra}</div></div>`;
  }
  function h(html) { app.innerHTML = html; }
  function on(id, ev, fn) { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }

  function renderSession() {
    const n = STEP_NUM[S.step] || 0;
    document.getElementById("stepLabel").textContent = S.step === "welcome" || S.step === "about" ? "Ready when you are" : `Step ${n} of 6`;
    document.getElementById("timeLabel").textContent = `⏱ ${fmt(S.elapsed)} / 10:00`;
    document.getElementById("stepFill").style.width = (n / 6) * 100 + "%";
    const tf = document.getElementById("timeFill");
    tf.style.width = Math.min(100, (S.elapsed / 600) * 100) + "%";
    tf.parentElement.classList.toggle("over", S.elapsed > 600);
  }
  function renderNotes() {
    document.getElementById("notesList").innerHTML =
      S.notes.slice(-8).map((n) => `<li>${esc(n)}</li>`).join("") || "<li>No notes yet.</li>";
  }

  // ---------------- screens ----------------
  const screens = {};

  screens.welcome = () => {
    const resume = S.lastStep && S.lastStep !== "warmup" || (S.lastStep === "warmup" && S.elapsed > 0);
    h(`<h2>Hi Aarav! 👋</h2>
      ${agent("guide", "We will solve one history mystery together: **why did so many different people join the revolt of 1857?** It takes about **10 minutes**. You can pause any time and come back.")}
      <div class="card">
        <b>Your team</b>
        ${agent("meera", "I explain things in simple words.")}
        ${agent("kabir", "I ask “why?” to make your thinking stronger. I never give answers away!")}
        ${agent("sana", "I check sources: who wrote it, when, and why.")}
      </div>
      <div class="actions">
        ${resume ? `<button id="resumeBtn" class="grow">▶ Continue where you left off (${fmt(S.elapsed)} used)</button>
                    <button id="restartBtn" class="secondary">Start over</button>`
                 : `<button id="startBtn" class="grow">Start the 10-minute mission</button>`}
      </div>`);
    on("startBtn", "click", () => { S.startedAt = new Date().toISOString(); note("Guide: session started"); go("warmup"); });
    on("resumeBtn", "click", () => { note("Guide: learner resumed at " + S.lastStep); go(S.lastStep); });
    on("restartBtn", "click", () => { S = fresh(); save(); renderNotes(); go("welcome"); });
  };

  // Step 1 — warm-up diagnostic (profile adaptivity)
  screens.warmup = () => {
    const w = C.warmup;
    h(`<h2>Step 1 · Warm-up</h2>
      ${agent("meera", w.q + " There is no score here.")}
      <div id="opts">${w.options.map((o) => `<button class="option" data-id="${o.id}">${esc(o.text)}</button>`).join("")}</div>
      <div id="fb"></div>
      <div class="actions"><button id="next" disabled class="grow">Next →</button></div>`);
    app.querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => {
      const o = w.options.find((x) => x.id === b.dataset.id);
      app.querySelectorAll(".option").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      S.warmupTag = o.tag; flagMisc(o.tag, "warm-up"); save();
      document.getElementById("fb").innerHTML = agent("meera", w.feedback[o.tag]);
      document.getElementById("next").disabled = false;
    }));
    on("next", "click", () => {
      note(`Meera -> team: warm-up answer = ${S.warmupTag}` + (S.warmupTag === "M1" ? " (single-cause idea; adding extra 'many causes' explanation)" : ""));
      go("concept");
    });
  };

  // Step 2 — concept (adapts to warm-up)
  screens.concept = () => {
    const c = C.concept;
    const extra = S.warmupTag === "M1" || S.warmupTag === "unsure";
    h(`<h2>Step 2 · The fuel and the spark</h2>
      ${agent("meera", c.base.join("\n").replace(/\n/g, " \n"))}
      ${extra ? agent("kabir", c.extraForM1.join(" ")) : ""}
      ${agent("sana", c.sourceIdea)}
      <div class="actions"><button id="next" class="grow">I am ready to sort causes →</button></div>`);
    app.querySelectorAll(".agent .msg")[0].innerHTML = c.base.map(md).join("<br>");
    on("next", "click", () => go("sort"));
  };

  // Step 3 — sort causes (format: classification)
  screens.sort = () => {
    const s = C.sort;
    h(`<h2>Step 3 · Sort the causes</h2>
      ${agent("meera", "Put each cause in the right box. Ask yourself: **who was hurt by this?** Kings → Political, farmers/weavers → Economic, believers → Social-religious, soldiers → Military.")}
      <div id="cards">${s.cards.map((c) => `
        <div class="sortcard" id="sc-${c.id}"><span>${esc(c.text)}</span>
          <select data-id="${c.id}" aria-label="Category for ${esc(c.text)}">
            <option value="">Choose a box…</option>
            ${s.categories.map((k) => `<option ${S.sort[c.id] === k ? "selected" : ""}>${k}</option>`).join("")}
          </select></div>`).join("")}</div>
      <div id="fb"></div>
      <div class="actions">
        <button id="hint" class="secondary">💡 Hint</button>
        <button id="check" class="grow">Check</button>
      </div>`);
    app.querySelectorAll("select").forEach((sel) => sel.addEventListener("change", () => { S.sort[sel.dataset.id] = sel.value; save(); }));
    on("hint", "click", () => {
      S.hints++; save();
      const wrong = s.cards.find((c) => S.sort[c.id] !== c.answer);
      const fb = document.getElementById("fb");
      if (!wrong) { fb.innerHTML = agent("meera", "Everything looks sorted. Press Check!"); return; }
      if (S.hints >= 2) {
        fb.innerHTML = agent("meera", `Worked example: “${wrong.text}” → hurts ${wrong.answer === "Political" ? "kings and rulers" : wrong.answer === "Economic" ? "farmers, weavers and traders" : wrong.answer === "Military" ? "soldiers" : "people's beliefs"}, so it goes in **${wrong.answer}**.`);
        note("Guide: 2+ hints used -> Meera gave a worked example");
      } else {
        fb.innerHTML = agent("kabir", `Look at “${wrong.text}”. Who would be angry about this?`);
      }
    });
    on("check", "click", () => {
      S.sortAttempts++;
      let correct = 0, militaryOver = 0;
      s.cards.forEach((c) => {
        const el = document.getElementById("sc-" + c.id);
        const ok = S.sort[c.id] === c.answer;
        if (ok) correct++;
        if (!ok && S.sort[c.id] === "Military") militaryOver++;
        el.classList.toggle("good", ok); el.classList.toggle("retry", !ok);
      });
      const fb = document.getElementById("fb");
      if (correct === s.cards.length) {
        fb.innerHTML = `<div class="feedback good">✅ ${s.feedback.allCorrect}</div><div class="actions"><button id="next" class="grow">Next: read real sources →</button></div>`;
        note(`Meera -> team: sorted all causes (attempts: ${S.sortAttempts})`);
        on("next", "click", () => go("sourceA"));
      } else if (militaryOver >= 2) {
        flagMisc("M1", "sort");
        fb.innerHTML = `<div class="feedback retry">${correct}/6 placed well.</div>` + agent("kabir", s.feedback.m1Pattern);
        note("Kabir -> team: learner puts non-army causes under Military (M1 signal)");
      } else {
        fb.innerHTML = `<div class="feedback retry">${correct}/6 placed well. ${s.feedback.someWrong}</div>`;
      }
      save();
    });
  };

  // Step 4 — source lab (MCQ purpose + reliability rating), A then B
  function sourceScreen(idx) {
    const src = C.sources[idx];
    const st = S.sources[src.id];
    h(`<h2>Step 4 · Source lab (${idx + 1} of 2)</h2>
      <div class="source"><b>${esc(src.title)}</b><p>${esc(src.text)}</p>
        <div class="meta">✍️ <b>Who:</b> ${esc(src.author)}<br>📅 <b>When:</b> ${esc(src.date)}</div></div>
      ${agent("sana", src.purposeQ)}
      <div id="purp">${src.purposeOptions.map((o) => `<button class="option" data-id="${o.id}">${esc(o.text)}</button>`).join("")}</div>
      <div id="fb1"></div>
      <div id="rate" style="display:none">
        ${agent("sana", C.ratingQuestion)}
        <div id="rates">${C.ratingOptions.map((o) => `<button class="option" data-r="${o.id}">${o.text}</button>`).join("")}</div>
        <div id="fb2"></div>
      </div>
      <div class="actions"><button id="next" class="grow" disabled>Next →</button></div>`);
    st.attempts = st.attempts || 0;
    app.querySelectorAll("#purp .option").forEach((b) => b.addEventListener("click", () => {
      const o = src.purposeOptions.find((x) => x.id === b.dataset.id);
      st.attempts++; st.purpose = o.tag;
      flagMisc(o.tag, "source " + src.id);
      app.querySelectorAll("#purp .option").forEach((x) => x.classList.remove("good", "retry", "selected"));
      b.classList.add(o.tag === "ok" ? "good" : "retry");
      const fb = document.getElementById("fb1");
      if (o.tag === "ok") {
        fb.innerHTML = `<div class="feedback good">✅ ${C.sourceFeedback.ok}</div>`;
        document.getElementById("rate").style.display = "block";
      } else {
        fb.innerHTML = agent(o.tag === "M2" ? "sana" : "meera", C.sourceFeedback[o.tag]);
        note(`Sana -> team: Source ${src.id} purpose answer shows ${o.tag}`);
      }
      save();
    }));
    app.querySelectorAll("#rates .option").forEach((b) => b.addEventListener("click", () => {
      st.rating = b.dataset.r;
      app.querySelectorAll("#rates .option").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      const match = st.rating === src.bestRating;
      document.getElementById("fb2").innerHTML =
        `<div class="feedback ${match ? "good" : "info"}">${match ? "✅ I agree with you. " : "Sana’s view is a little different: "}${esc(src.ratingWhy)}</div>`;
      note(`Sana -> team: rated Source ${src.id} = ${src.bestRating}; learner said ${st.rating}`);
      document.getElementById("next").disabled = false;
      save();
    }));
    on("next", "click", () => go(idx === 0 ? "sourceB" : "disagree"));
  }
  screens.sourceA = () => sourceScreen(0);
  screens.sourceB = () => sourceScreen(1);

  // Step 5 — the disagreement moment (design challenge)
  screens.disagree = () => {
    const d = C.disagreement;
    h(`<h2>Step 5 · Two views</h2>
      ${agent("guide", "Meera and Sana read the same sources but disagree on: **" + d.question + "**")}
      <div class="views">
        ${agent("meera", d.meera.text, `<div class="relies">Relies on: ${esc(d.meera.reliesOn)}</div>`)}
        ${agent("sana", d.sana.text, `<div class="relies">Relies on: ${esc(d.sana.reliesOn)}</div>`)}
      </div>
      ${agent("guide", d.guide)}
      <div id="choices">${d.choices.map((c) => `<button class="option ${S.choice === c.id ? "selected" : ""}" data-id="${c.id}">${esc(c.text)}</button>`).join("")}</div>
      <div id="ask"></div>`);
    app.querySelectorAll("#choices .option").forEach((b) => b.addEventListener("click", () => {
      S.choice = b.dataset.id; save();
      app.querySelectorAll("#choices .option").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      note(`Guide -> team: learner chose "${S.choice}". Kabir to ask for a reason; no view marked wrong.`);
      document.getElementById("ask").innerHTML = agent("kabir", d.kabirAsk[S.choice]) + `
        <div class="starters">${d.sentenceStarters.map((s) => `<button class="chip">${s}</button>`).join("")}</div>
        <textarea id="reason" placeholder="One line is enough…">${esc(S.kabirReply)}</textarea>
        <div id="fb"></div>
        <div class="actions"><button id="send" class="grow">Send to Kabir</button></div>`;
      app.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
        const t = document.getElementById("reason"); t.value += (t.value ? " " : "") + c.textContent.replace("…", ""); t.focus();
      }));
      on("send", "click", () => {
        const r = document.getElementById("reason").value.trim();
        S.kabirReply = r; save();
        const fb = document.getElementById("fb");
        if (r.length < 12) {
          fb.innerHTML = agent("kabir", "Just a few more words please. Try a sentence starter above. 🙂");
          return;
        }
        const cls = ruleClassify(r);
        const meeraLine = cls.misconception === "M1"
          ? "Good thinking about the spark. Remember the weavers and farmers in Source B too."
          : "Nice reason! You used evidence, just like a historian.";
        fb.innerHTML = agent("kabir", "Thanks! That is a real reason. I will remember it.") + agent("meera", meeraLine)
          + `<div class="actions"><button id="next" class="grow">Next: your final verdict →</button></div>`;
        note(`Kabir -> team: learner's reason classified ${cls.misconception}`);
        on("next", "click", () => go("verdict"));
      });
    }));
    if (S.choice) app.querySelector(`#choices .option[data-id="${S.choice}"]`).click();
  };

  // Step 6 — verdict, evaluated by the agent team (AI + fallback)
  screens.verdict = () => {
    const v = C.verdict;
    const tries = S.verdicts.length;
    h(`<h2>Step 6 · Your verdict</h2>
      ${agent("guide", v.prompt)}
      ${tries > 0 ? agent("meera", "Second try — use the starters below. Short is fine!") : ""}
      <div class="starters">${v.starters.map((s) => `<button class="chip">${s}</button>`).join("")}</div>
      <textarea id="ans" placeholder="Write 2–3 short sentences…"></textarea>
      <div class="actions"><button id="send" class="grow">Send to the team</button></div>
      <div id="out"></div>`);
    app.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
      const t = document.getElementById("ans"); t.value += (t.value ? " " : "") + c.textContent.replace("…", ""); t.focus();
    }));
    on("send", "click", async () => {
      const ans = document.getElementById("ans").value.trim();
      const out = document.getElementById("out");
      if (ans.length < 20) { out.innerHTML = agent("kabir", "Can you write a little more? Two sentences please."); return; }
      document.getElementById("send").disabled = true;
      out.innerHTML = agent("sana", "Reading your answer and checking your sources…");
      const r = await evaluate(ans);
      S.verdicts.push({ text: ans, misconception: r.misconception, source: r.source });
      S.result = r; flagMisc(r.misconception, "verdict"); save();
      (r.teamNotes || []).forEach(note);
      const label = r.source === "ai"
        ? `<span class="tag ai">AI agents · checked</span>`
        : `<span class="tag fallback">Offline tutor · recorded sample replies (AI unavailable)</span>`;
      const ok = r.misconception === "ok";
      out.innerHTML = `<p>${label}</p>`
        + agent("sana", r.replies.sana) + agent("meera", r.replies.meera) + agent("kabir", r.replies.kabir)
        + `<div class="actions">
            ${!ok && S.verdicts.length < 2 ? `<button id="retry" class="secondary grow">✍️ Improve my answer</button>` : ""}
            <button id="finish" class="grow">See my summary →</button></div>`;
      on("retry", "click", () => { note("Guide: learner chose to improve verdict (performance adaptivity)"); render(); });
      on("finish", "click", () => go("summary"));
    });
  };

  async function evaluate(answer) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch("/api/agents", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
        body: JSON.stringify({ answer, state: { warmupTag: S.warmupTag, choice: S.choice } })
      });
      clearTimeout(t);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      const cls = ruleClassify(answer);
      return { source: "fallback", misconception: cls.misconception, score: cls.score,
        replies: C.fallbackReplies[cls.misconception],
        teamNotes: ["Network/AI unavailable (" + e.message + ") -> rule-based tutor in the browser"] };
    }
  }

  // Same rule-based tutor as the server (used if the server is unreachable)
  function ruleClassify(text) {
    const t = (text || "").toLowerCase();
    const has = (arr) => arr.some((w) => t.includes(w));
    const cats = {
      military: has(["cartridge", "grease", "rifle", "sepoy", "army", "soldier", "pay"]),
      political: has(["kingdom", "lapse", "awadh", "annex", "king", "rani", "ruler", "state"]),
      economic: has(["tax", "land", "farmer", "weaver", "trade", "merchant", "artisan", "cloth", "zamindar", "money"]),
      religious: has(["religion", "religious", "convert", "faith", "belief", "caste"])
    };
    const n = Object.values(cats).filter(Boolean).length;
    const usesSource = /source\s*[ab]\b|proclamation|officer|report/.test(t);
    const purpose = has(["want", "purpose", "persuade", "bias", "biased", "hide", "make people join", "propaganda", "exaggerat", "point of view", "reason to"]);
    const trust = has(["must be true", "so it is true", "he was there", "was there so", "official so", "eyewitness so", "cannot lie", "can't lie", "is true because"]);
    let m = "partial";
    if (trust && !purpose) m = "M2";
    else if (cats.military && n === 1) m = "M1";
    else if (n >= 2 && usesSource && purpose) m = "ok";
    return { misconception: m, score: m === "ok" ? 2 : m === "partial" ? 1 : 0 };
  }

  // Summary — outcomes + log data (D8)
  screens.summary = () => {
    const sortOk = C.sort.cards.every((c) => S.sort[c.id] === c.answer);
    const srcOk = ["A", "B"].every((k) => S.sources[k].purpose === "ok");
    const final = S.result ? S.result.misconception : "partial";
    const lo = (ok, txt) => `<li>${ok ? "✅" : "🟡"} ${txt}</li>`;
    const firstTry = ["A", "B"].map((k) => `${k}: ${S.sources[k].attempts || 0} tries`).join(", ");
    h(`<h2>Mission complete, detective! 🎉</h2>
      ${agent("guide", `You finished in **${fmt(S.elapsed)}**. Every step you took counts — even the retries. That is how historians work.`)}
      <div class="card"><b>What you can do now</b><ul>
        ${lo(sortOk, "LO1 – Explain and classify causes of 1857")}
        ${lo(srcOk, "LO2 – Judge a source by who, when and why")}
        ${lo(final === "ok", "LO3 – Compare sources and justify your verdict")}
      </ul>${final !== "ok" ? `<p>🟡 = almost there. Come back tomorrow and try Step 6 again.</p>` : ""}</div>
      <div class="card"><b>Model answer (compare with yours)</b><p>${esc(C.verdict.modelAnswer)}</p>
        ${S.verdicts.length ? `<p><b>Your answer:</b> ${esc(S.verdicts[S.verdicts.length - 1].text)}</p>` : ""}</div>
      <div class="card"><b>Learning log</b> <span class="tag">for teacher / evaluation</span>
        <table class="log">
          <tr><th>Warm-up</th><td>${S.warmupTag || "-"}</td></tr>
          <tr><th>Sort attempts</th><td>${S.sortAttempts}</td></tr>
          <tr><th>Source tries</th><td>${firstTry}</td></tr>
          <tr><th>Hints used</th><td>${S.hints}</td></tr>
          <tr><th>Disagreement choice</th><td>${S.choice || "-"}</td></tr>
          <tr><th>Verdict tries</th><td>${S.verdicts.map((v) => v.misconception + " (" + v.source + ")").join(" → ") || "-"}</td></tr>
          <tr><th>Misconceptions seen</th><td>${S.misconceptions.join(", ") || "none"}</td></tr>
          <tr><th>Time per step</th><td>${Object.entries(S.stepTimes).map(([k, v]) => k + " " + fmt(v)).join(", ")}</td></tr>
        </table></div>
      <div class="actions"><button id="again" class="secondary grow">Start a new session</button></div>`);
    on("again", "click", () => { S = fresh(); save(); renderNotes(); go("welcome"); });
  };

  screens.about = () => {
    h(`<h2>About this app</h2>
      <div class="card">
        <p><b>1857 Detectives</b> — ET 617 End-Semester Exam.</p>
        <p><b>Roll number (identity token): 23B1239</b></p>
        <table class="log">
          <tr><th>P</th><td>P3 – Multi-agent collaborative learning environment</td></tr>
          <tr><th>T</th><td>P3-T5 – Causes of the 1857 revolt: weighing sources (Class 8)</td></tr>
          <tr><th>L</th><td>L5 – Repeating learner, high anxiety, low self-efficacy</td></tr>
          <tr><th>C</th><td>C4 – 10-minute sessions with stop and resume</td></tr>
        </table>
        <p><b>Agents:</b> Meera (Explainer), Kabir (Challenger), Sana (Source Checker), plus a Guide that handles disagreements. They share a “Team notes” board.</p>
        <p><b>AI:</b> the final verdict is evaluated by two chained LLM calls (Sana first, then Meera + Kabir read Sana's notes). Outputs are checked for format, length, tone and dates. If anything fails, a rule-based tutor with recorded sample replies is used and labelled.</p>
        <p><b>Sources</b> in the app are simplified, paraphrased extracts written for Class 8 learners.</p>
        <p>Built with plain HTML/CSS/JS + one Vercel serverless function. No UI library.</p>
      </div>
      <div class="actions"><button id="back" class="grow">← Back</button></div>`);
    on("back", "click", () => go(S.lastStep || "welcome"));
  };

  function render() { (screens[S.step] || screens.welcome)(); renderSession(); renderNotes(); }

  document.getElementById("aboutLink").addEventListener("click", (e) => { e.preventDefault(); go("about"); });
  document.getElementById("pauseBtn").addEventListener("click", () => {
    paused = true; save();
    h(`<h2>Saved ⏸</h2>${agent("guide", `Your progress is saved on this device (${fmt(S.elapsed)} used). Close the app any time — next time press **Continue where you left off**.`)}
      <div class="actions"><button id="unpause" class="grow">▶ Keep going now</button></div>`);
    on("unpause", "click", () => { paused = false; render(); });
  });

  // Always open on welcome so "Continue where you left off" is visible
  if (S.step !== "welcome" && S.step !== "summary") S.step = "welcome";
  render();
})();
