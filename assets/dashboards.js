/* Dev Data Weekly registry: ONE entry per published dashboard, newest first.
   topic = main theme key; also = up to 2 secondary theme keys; region = region key. */
window.DDW_TOPICS = {
  humanitarian: { label: "Humanitarian & Crises", icon: "⛑" },
  climate:      { label: "Climate & Environment", icon: "🌿" },
  health:       { label: "Health", icon: "✚" },
  children:     { label: "Children & Education", icon: "✎" },
  gender:       { label: "Gender & Inclusion", icon: "⚥" },
  migration:    { label: "Migration & Displacement", icon: "➜" },
  finance:      { label: "SDGs & Development Finance", icon: "◎" }
};
window.DDW_REGIONS = { global: "Global", asiapac: "Asia-Pacific", africa: "Africa", mena: "Middle East & North Africa", latam: "Latin America & Caribbean", europe: "Europe" };
window.DDW = [
  { n: 2, title: "Climate finance: promised vs delivered", url: "/devdataweekly/issues/2026-11-04-climate-finance/", date: "2026-11-04",
    topic: "climate", also: ["finance"], region: "global", summary: "$136.7B delivered in 2024, $300B promised by 2035. Who is still waiting." },
  { n: 1, title: "The 2026 Aid Gap", url: "/devdataweekly/issues/2026-10-28-aid-gap/", date: "2026-10-28",
    topic: "humanitarian", also: ["finance"], region: "global", summary: "239M people in need, 87M prioritised. Where the money goes, and who pays now." }
];

/* "More on this theme" on dashboard pages: <section data-related="<url of this page>"></section> */
(() => {
  const box = document.querySelector("[data-related]"); if (!box) return;
  const me = box.dataset.related, list = window.DDW || [], T = window.DDW_TOPICS, R = window.DDW_REGIONS;
  const self = list.find((d) => d.url === me); if (!self) return;
  const mine = [self.topic, ...(self.also || [])];
  const score = (d) => (d.topic === self.topic ? 3 : 0) + (d.also || []).concat(d.topic).filter((t) => mine.includes(t)).length + (d.region === self.region ? 0.5 : 0);
  const others = list.filter((d) => d.url !== me).sort((a, b) => score(b) - score(a) || (a.date < b.date ? 1 : -1)).slice(0, 3);
  if (!others.length) { box.remove(); return; }
  const same = others.some((d) => d.topic === self.topic || (d.also || []).includes(self.topic));
  const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  box.innerHTML = `<div class="wrap"><div class="sec-head" style="margin-bottom:20px"><span class="eyebrow">${same ? "More on " + e(T[self.topic].label) : "Explore more dashboards"}</span><h2 style="font-size:clamp(26px,3.4vw,38px)">Keep exploring</h2></div>
    <div class="rel-grid">${others.map((d) => `<a class="panel rel" href="${d.url}"><div class="rel-tags"><span class="ttag t-${d.topic}">${T[d.topic].icon} ${e(T[d.topic].label)}</span><span class="rtag">${e(R[d.region] || "")}</span></div><h3>${e(d.title)}</h3><p>${e(d.summary)}</p><span class="rel-go">#${String(d.n).padStart(2, "0")} · Open dashboard →</span></a>`).join("")}</div></div>`;
})();

/* Theme filter on the homepage dashboards list */
(() => {
  const bar = document.getElementById("topic-filter"), cards = document.querySelector(".cards"); if (!bar || !cards) return;
  const T = window.DDW_TOPICS, items = [...cards.querySelectorAll(".card")];
  const present = new Set(); items.forEach((c) => (c.dataset.topics || "").split(" ").filter(Boolean).forEach((t) => present.add(t)));
  const keys = Object.keys(T).filter((k) => present.has(k));
  bar.innerHTML = `<button type="button" class="fpill on" data-k="all" aria-pressed="true">All</button>` + keys.map((k) => `<button type="button" class="fpill t-${k}" data-k="${k}" aria-pressed="false"><span aria-hidden="true">${T[k].icon}</span> ${T[k].label}</button>`).join("");
  const status = document.getElementById("topic-status");
  function apply(k) {
    let shown = 0;
    items.forEach((c) => { const ok = k === "all" || (c.dataset.topics || "").split(" ").includes(k); c.hidden = !ok; if (ok && !c.classList.contains("soon")) shown++; });
    cards.classList.toggle("filtered", k !== "all");
    bar.querySelectorAll(".fpill").forEach((b) => { const on = b.dataset.k === k; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    if (status) status.textContent = k === "all" ? "" : shown ? `Showing ${shown} dashboard${shown === 1 ? "" : "s"} on ${T[k].label}` : `No live dashboards on ${T[k].label} yet. One is on the way.`;
  }
  bar.addEventListener("click", (e) => { const b = e.target.closest(".fpill"); if (b) apply(b.dataset.k); });
})();

/* Copy citation buttons */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]"); if (!b) return;
  const t = document.getElementById(b.dataset.copy)?.textContent || "";
  const done = () => { const o = b.textContent; b.textContent = "Copied ✓"; setTimeout(() => (b.textContent = o), 1600); };
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(done).catch(() => { const r = document.createRange(); r.selectNodeContents(document.getElementById(b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); });
});

/* Newsletter sign-up: <section data-subscribe></section> */
(() => {
  document.querySelectorAll("[data-subscribe]").forEach((box) => {
    box.classList.add("tight", "gut");
    box.innerHTML = `<div class="wrap"><div class="panel sub reveal in"><div class="sub-copy"><span class="eyebrow">Data Stories · free newsletter</span><h3>Get each dashboard in your inbox</h3><p>One data story every Wednesday: 3 key takeaways and a link to the full dashboard. No spam, unsubscribe anytime.</p></div>
      <form class="sub-form" action="https://buttondown.com/api/emails/embed-subscribe/nafiulazim" method="post" target="_blank">
        <label class="sr-only" for="sub-${Math.random().toString(36).slice(2,7)}">Email address</label>
        <input type="email" name="email" required placeholder="you@example.org" autocomplete="email" aria-label="Email address">
        <input type="hidden" name="tag" value="${location.pathname === "/" ? "homepage" : "dashboard"}">
        <input type="hidden" value="1" name="embed">
        <button type="submit" class="btn btn-primary">Subscribe</button>
      </form><p class="sub-note">Check your inbox to confirm. Views my own.</p></div></div>`;
    const f = box.querySelector("form");
    f.addEventListener("submit", () => setTimeout(() => { f.reset(); box.querySelector(".sub-note").textContent = "Almost done: check your inbox and click the confirmation link."; }, 300));
  });
})();
