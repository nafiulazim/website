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
      f.reset(); msg.className = "form-msg ok"; msg.textContent = "Thank you! Your review will appear here once it's approved.";
    } catch (e) { msg.className = "form-msg err"; msg.textContent = "That didn't send. Check your connection and try again."; }
    btn.disabled = false; btn.textContent = "Send review";
  });
}
loadReviews(); setupForm();
