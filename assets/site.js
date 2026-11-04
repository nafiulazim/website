/* ============================================================
   REVIEWS SETUP — fill these in once (see README.md, "Reviews")
   ============================================================ */
const REVIEWS_CONFIG = {
  // Google Form "formResponse" address, e.g.
  // "https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse"
  formAction: "https://docs.google.com/forms/d/e/1FAIpQLSfto6kspq54uXc_2IcjAhxs7LYtWujaSTbA0HMyxlYzi_oPxg/formResponse",
  // Field IDs from your Google Form's pre-filled link
  fields: { name: "entry.2129590836", role: "entry.1835103435", rating: "entry.161789734", review: "entry.1344080320" },
  // Published CSV link of the "Public" tab (approved reviews only)
  approvedCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRaXXmUKwzF9paUKcYEXPzjn8aKntLhjXg5-DzurXhz-P_09kT4_t_I267cjDsgX2TT2qYqCWcA2D0t/pub?gid=124137053&single=true&output=csv"
};

document.documentElement.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Reveal on scroll */
const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }) : null;
function watch(el) { io && !reduce ? io.observe(el) : el.classList.add("in"); }
document.querySelectorAll(".reveal,[data-anim]").forEach(watch);
/* Safety: never leave content hidden */
setTimeout(() => document.querySelectorAll(".reveal:not(.in),[data-anim]:not(.in)").forEach((el) => el.classList.add("in")), 4000);

/* Count-up numbers: <b data-count="239" data-prefix="$" data-suffix="M" data-dec="0"> */
const cio = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
}, { threshold: 0.4 }) : null;
function fmt(el, v) {
  const d = +(el.dataset.dec || 0);
  el.textContent = (el.dataset.prefix || "") + v.toFixed(d) + (el.dataset.suffix || "");
}
function countUp(el) {
  const end = +el.dataset.count; if (reduce) return fmt(el, end);
  const t0 = performance.now(), dur = 1600;
  (function step(t) {
    const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 4);
    fmt(el, end * k); if (p < 1) requestAnimationFrame(step);
  })(t0);
}
document.querySelectorAll("[data-count]").forEach((el) => { cio && !reduce ? cio.observe(el) : fmt(el, +el.dataset.count); });

/* Year */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------------- Reviews ---------------- */
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
async function loadReviews() {
  const box = document.getElementById("reviews-list"); if (!box) return;
  if (!REVIEWS_CONFIG.approvedCsv) return;
  try {
    const res = await fetch(REVIEWS_CONFIG.approvedCsv + (REVIEWS_CONFIG.approvedCsv.includes("?") ? "&" : "?") + "t=" + Date.now());
    const rows = parseCSV(await res.text()).slice(1); // skip header: Name, Role, Rating, Review
    if (!rows.length) return;
    box.innerHTML = rows.reverse().map(([name, role, rating, review]) => {
      const n = Math.max(0, Math.min(5, parseInt(rating) || 0));
      return `<article class="panel review reveal"><div class="stars" aria-label="${n} out of 5">${"★".repeat(n)}${"☆".repeat(5 - n)}</div>
        <p>“${esc(review)}”</p><div class="who"><b>${esc(name || "Anonymous")}</b>${role ? " · " + esc(role) : ""}</div></article>`;
    }).join("");
    box.querySelectorAll(".reveal").forEach(watch);
  } catch (e) { /* keep the empty state */ }
}
function setupForm() {
  const f = document.getElementById("review-form"); if (!f) return;
  const msg = document.getElementById("form-msg");
  f.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const data = new FormData(f);
    if (!data.get("review") || !data.get("name")) { msg.className = "form-msg err"; msg.textContent = "Please add your name and a short review."; return; }
    if (data.get("website")) return; // spam trap
    if (!REVIEWS_CONFIG.formAction) { msg.className = "form-msg err"; msg.textContent = "Reviews open very soon. Please check back in a few days."; return; }
    const body = new URLSearchParams();
    for (const k of ["name", "role", "rating", "review"]) body.append(REVIEWS_CONFIG.fields[k], data.get(k) || "");
    const btn = f.querySelector("button"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      await fetch(REVIEWS_CONFIG.formAction, { method: "POST", mode: "no-cors", body });
      f.reset(); msg.className = "form-msg ok"; msg.textContent = "Thank you for your feedback! It will appear here shortly.";
    } catch (e) { msg.className = "form-msg err"; msg.textContent = "That didn't send. Check your connection and try again."; }
    btn.disabled = false; btn.textContent = "Send review";
  });
}
loadReviews(); setupForm();

/* Light / dark toggle */
(() => {
  const b = document.getElementById("theme-btn"); if (!b) return;
  const root = document.documentElement;
  b.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* Scroll progress bar + nav shadow */
(() => {
  const bar = document.createElement("div"); bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);
  const nav = document.querySelector(".nav");
  let ticking = false, last = scrollY;
  function upd() {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
    if (nav) {
      nav.classList.toggle("scrolled", scrollY > 8);
      const y = scrollY, dy = y - last;
      if (y < 80 || dy < -4) nav.classList.remove("hide");
      else if (dy > 6) nav.classList.add("hide");
      last = y;
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();

/* Highlight the nav link for the section in view */
(() => {
  const links = [...document.querySelectorAll('.nav ul a[href*="#"]')];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const map = new Map();
  links.forEach((a) => { const id = a.getAttribute("href").split("#")[1]; const s = id && document.getElementById(id); if (s) map.set(s, a); });
  if (!map.size) return;
  const o = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.remove("on")); map.get(e.target).classList.add("on"); } });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, s) => o.observe(s));
})();

/* Cursor spotlight on panels */
(() => {
  if (matchMedia("(hover: none)").matches) return;
  document.addEventListener("pointermove", (e) => {
    const p = e.target.closest && e.target.closest(".panel"); if (!p) return;
    const r = p.getBoundingClientRect();
    p.style.setProperty("--mx", e.clientX - r.left + "px");
    p.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });
})();

/* Countdown to the next Wednesday dashboard (14:00 Bangkok = 07:00 UTC) */
(() => {
  const els = document.querySelectorAll("[data-next-drop]"); if (!els.length) return;
  function next() {
    const n = new Date(); const t = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 7, 0, 0));
    let add = (3 - t.getUTCDay() + 7) % 7; if (add === 0 && n >= t) add = 7;
    t.setUTCDate(t.getUTCDate() + add); return t;
  }
  function tick() {
    const ms = next() - new Date(), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
    els.forEach((el) => {
      el.querySelector("[data-d]").textContent = String(d).padStart(2, "0");
      el.querySelector("[data-h]").textContent = String(h).padStart(2, "0");
      el.querySelector("[data-m]").textContent = String(m).padStart(2, "0");
    });
  }
  tick(); setInterval(tick, 30000);
})();

/* Share buttons: <div class="share" data-share> with links/buttons carrying data-net */
(() => {
  const boxes = document.querySelectorAll("[data-share]"); if (!boxes.length) return;
  const meta = (p) => (document.querySelector(`meta[property="${p}"]`) || {}).content || "";
  const url = meta("og:url") || location.href.split("#")[0];
  const title = meta("og:title") || document.title;
  const desc = meta("og:description") || "";
  const e = encodeURIComponent;
  const links = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
    x: `https://twitter.com/intent/tweet?text=${e(title)}&url=${e(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
    whatsapp: `https://wa.me/?text=${e(title + " " + url)}`,
    telegram: `https://t.me/share/url?url=${e(url)}&text=${e(title)}`,
    email: `mailto:?subject=${e(title)}&body=${e(desc + "\n\n" + url)}`
  };
  boxes.forEach((box) => {
    if (navigator.share) box.classList.add("can-native");
    box.querySelectorAll("a[data-net]").forEach((a) => {
      const n = a.dataset.net; if (!links[n]) return;
      a.href = links[n];
      if (n !== "email") { a.target = "_blank"; a.rel = "noopener"; }
    });
    const copy = box.querySelector('[data-net="copy"]');
    if (copy) copy.addEventListener("click", async () => {
      const html = copy.innerHTML;
      try { await navigator.clipboard.writeText(url); copy.textContent = "Link copied"; }
      catch (err) { window.prompt("Copy this link:", url); }
      copy.classList.add("copied");
      setTimeout(() => { copy.innerHTML = html; copy.classList.remove("copied"); }, 2000);
    });
    const nat = box.querySelector('[data-net="native"]');
    if (nat) nat.addEventListener("click", () => navigator.share({ title, text: desc, url }).catch(() => {}));
  });
})();

/* Data tooltips: hover (mouse), tap (touch) or focus (keyboard) on [data-tip] shows exact value + source */
(() => {
  const tip = document.createElement("div"); tip.className = "dtip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip);
  let cur = null, shownAt = 0;
  const html = (el) => { const e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    return `<b>${e(el.dataset.tip)}</b>${el.dataset.src ? `<span>Source: ${e(el.dataset.src)}</span>` : ""}`; };
  function place(x, y) {
    const r = tip.getBoundingClientRect(), pad = 12;
    let left = x - r.width / 2, top = y - r.height - 14;
    if (top < pad) top = y + 18;
    left = Math.max(pad, Math.min(innerWidth - r.width - pad, left));
    tip.style.left = left + "px"; tip.style.top = top + "px";
  }
  function show(el, x, y) {
    if (cur !== el) shownAt = performance.now();
    cur = el; tip.innerHTML = html(el); tip.classList.add("on");
    if (x == null) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    place(x, y);
  }
  function hide() { cur = null; tip.classList.remove("on"); }
  function prep(root) { root.querySelectorAll("[data-tip]").forEach((el) => { if (el.hasAttribute("data-notab")) return; if (!el.hasAttribute("tabindex")) el.tabIndex = 0; if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", el.dataset.tip + (el.dataset.src ? ". Source: " + el.dataset.src : "")); }); }
  prep(document);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && prep(n.parentNode || n)))).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const el = e.target.closest && e.target.closest("[data-tip]");
    if (el) show(el, e.clientX, e.clientY); else if (cur) hide();
  }, { passive: true });
  document.addEventListener("click", (e) => {
    const el = e.target.closest && e.target.closest("[data-tip]");
    if (el && e.pointerType !== "mouse") { if (cur === el && performance.now() - shownAt > 450) hide(); else show(el); }
    else if (!el) hide();
  });
  document.addEventListener("focusin", (e) => { if (e.target.matches && e.target.matches("[data-tip]")) show(e.target); });
  document.addEventListener("focusout", hide);
  addEventListener("scroll", () => { if (cur && !cur.matches(":focus")) hide(); }, { passive: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
})();
