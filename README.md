# nafiulazim.com

Personal site and passion project: weekly dashboards on global development data.


## ⚠️ DATA ACCURACY: THE MOST IMPORTANT RULE (read before building anything)
Credible, correct numbers matter more than design, speed or anything else. A dashboard with one wrong number is worse than no dashboard. If in doubt, leave it out.
1. SOURCE: only credible public sources (original UN/World Bank/OECD/IMF/national statistics reports and datasets, peer institutions, established news outlets). Every number must be confirmed in the ORIGINAL report/dataset, or by at least two independent reputable sources that agree exactly. Leave out anything that can't be confirmed or where sources disagree.
2. CROSS-CHECK BEFORE BUILDING: write a validation log (number, unit, period, scope, source URLs, exact quote/table where found). Then do a second, separate pass: re-open each source and re-check every value, unit (million vs billion, % vs percentage points), year/period, geography and definition (e.g. "provided and mobilised" vs "provided"; "people in need" vs "people targeted").
3. CONSISTENCY CHECKS (all must pass): parts add up to totals; shares match their numerators and denominators (recompute every %); no two numbers on the page contradict each other; the same figure is written identically everywhere (headline, takeaways, charts, tooltips, preview image, brief, data files, homepage card, LinkedIn post); derived numbers show their formula in the tooltip; rounding never changes meaning, and rounded values say "about".
4. AUTOMATED CHECK: run `python3 tools/check_numbers.py <issue-slug>` after building. It must report 0 problems (every number in the headline, takeaways, social tags, homepage card/tile and data.csv must appear in a data-tip with a data-src). Fix and rerun until clean.
5. REPORT: in the PR, include the validation log, the consistency checks you did (with the sums/percentages recomputed), the checker output, and the numbers you left out and why.

## Structure
```
index.html                                  homepage (nafiulazim.com)
CNAME                                       custom domain, do not delete
assets/site.css                             shared design
assets/site.js                              shared animations + reviews (settings at the top)
devdataweekly/issues/YYYY-MM-DD-topic/      one folder per weekly dashboard
```

## Adding a new dashboard
1. Add the folder `devdataweekly/issues/2026-11-04-climate-finance/index.html`
2. In `index.html`, copy one `<a class="panel card">` block to the top of the Dashboards list and update it
3. Commit. The site updates in about 1 minute.

## Reviews (approve before they appear)
Reviews go to a Google Form. You tick "Approved" in the Google Sheet, and only approved rows show on the site.
Settings live at the top of `assets/site.js` (`REVIEWS_CONFIG`).

## Data rules (for every dashboard)
- Only publish numbers that can be validated from a credible primary source (OECD, UN agencies, World Bank, IMF, CPI, national statistics or central banks, or the report itself).
- Each number must be confirmed by opening the primary source, or by at least two independent reputable reports of it that agree. If sources disagree or the figure can't be validated, leave it out.
- Use the newest edition of a dataset; don't publish outdated figures when a newer edition exists.
- Don't publish derived numbers (own arithmetic) unless clearly labelled as such.
- If not enough validated numbers are available, make a smaller dashboard and say so in the PR, rather than filling gaps.

## Issue design log (each new issue must differ from the last two)
| Issue | Accent | Chart types | Layout |
|---|---|---|---|
| #01 Aid gap (28 Oct 2026) | coral / teal | KPI cards, dot grid (waffle), funnel bars, ranked horizontal bars, before/after pairs, "on the ground" cards | KPI row → wide + narrow panels → two panels → card row → perspective panel |
| #02 Climate finance (4 Nov 2026) | green (#2f8a3e / #6fd685) | line/area trend with target, scorecard rail, donut + year table, proportional circles, slope chart, stat strip, comparison table with inline bars, needs progress band | full-width lead chart with scorecard rail → donut/circles split → slope + stat strip → comparison table → big-number band |

## Homepage rules for each new issue
- The hero "Latest" bento tile and the issue's card thumbnail must show a small version of THAT issue's main chart (its own chart type) in its own accent colour, as inline SVG with an `acc-<colour>` class defining `--a`/`--a-rgb` for light and dark. Never reuse another issue's preview visual (e.g. don't reuse the dot grid).
- The first card in the Dashboards list is the featured one (full width); new issues go first.
- Each issue's og.jpg must show that issue's own main chart and accent; give it a new file name if it replaces an older image (so social sites refresh their previews).

## Theme
Dark is the default on every page. The theme script in each page's <head> sets data-theme="dark" unless the visitor chose light with the toggle (saved in localStorage). Copy this script unchanged into new issues.

## Countdown
The homepage "Next dashboard drops in" tile has `data-latest="YYYY-MM-DD"`. Set it to the date of the newest published issue; the timer then counts down to 12 pm (noon) Bangkok, seven days later.

## Themes and tags (required for every new dashboard)
Theme keys: humanitarian, climate, health, children, gender, migration, finance. Region keys: global, asiapac, africa, mena, latam, europe.
1. Add an entry at the TOP of `window.DDW` in `assets/dashboards.js` (n, title, url, date, topic, also[≤2], region, one-line summary), then bump `dashboards.js?v=` on all pages.
2. Homepage card: add `data-topics="<main> <also…>"` on the `<a class="panel card">` and a `<div class="tags">` with `<span class="ttag t-<key>">icon Label</span>` chips after the `.meta` line. Upcoming cards get tags too.
3. Issue page hero `.metaline`: add `<span class="ttag t-<main>">icon Full label</span><span class="rtag">Region</span>`.
4. Issue page: add `<section class="tight gut" data-related="<this page url>"></section>` right before the Sources section, and include `<script src="/assets/dashboards.js?v=N"></script>` after site.js.
The homepage filter pills and "More on this theme" links build themselves from these.

## Takeaways, data download and citation (required for every new dashboard)
- Right after `</header>`: a `.takeaways` section with exactly 3 takeaways, using only figures that appear on the page with data-tip/data-src.
- TAKEAWAYS MUST BE SELF-EXPLANATORY: each one is understood on its own by someone who reads nothing else. Say WHAT was measured, FOR WHOM and WHEN (e.g. "climate finance for developing countries in 2024", "share of government humanitarian funding"); plain words, no jargon (explain any technical term in a few words, e.g. "adapt (for example flood defences)"); when comparing figures from different periods, say so; never link two facts with "after", "because" or "due to" unless the source states that link; add no claims that are not validated on the page. Max ~35 words each.
- Before the related section: the "Use this data" `.reuse` section (copy from Issue 02) with the CSV link, the copy-citation button and the citation `Azim, N. (YEAR). TITLE. Dev Data Weekly #NN, DATE. URL`.
- Data files in the issue folder, in TIDY format: `data.xlsx` (sheets "Data" + "Notes") and `data.csv` (same Data sheet, UTF-8 with BOM). Columns: Indicator, Value (plain number only), Unit, Year, Country / group, Type (Reported or Calculated), Source, Source link (direct URL to the original), Note (formula for calculated values, caveats like "approximate"). One number per row; split ranges and before/after pairs into separate rows. Only figures that appear on the page. Copy the generator approach used for Issues 01–02 and update the "All N figures" count. Buttons: Excel (primary) + CSV.

## Analytics
Every page must include the Cloudflare Web Analytics snippet just before `</body>` (copy it from any existing page).

## Newsletter
Every dashboard page includes `<section data-subscribe></section>` just before the related section (dashboards.js renders the Buttondown form for `nafiulazim`).

## Brief and chart images (required for every new dashboard)
After the page is final, run `python3 tools/build_assets.py <issue-slug>`. It renders `charts/chart-N.png` (light theme, with source and nafiulazim.com footer) for every panel that has a heading and 2+ data-tip marks, and `brief.pdf` (one A4 page: title, lede, takeaways, first two charts, sources, link). Open brief.pdf and check it is ONE page and readable; if a chart is cut off, adjust and rerun. Commit charts/ and brief.pdf.
The "Take it with you" reuse section (copy from Issue 02): primary button = brief.pdf, Copy citation, and a small "For analysts" line linking data.xlsx and data.csv. Chart ↓ PNG icons are added automatically by dashboards.js.

## Titles: state the finding, not the topic (required)
Every dashboard headline must NAME THE TOPIC and STATE THE FINDING (e.g. "in climate finance", "humanitarian aid"), so a reader who sees only the first line knows both what it is about and what the data says. This applies to the headline (h1), homepage card title, registry title, <title>, og:title/twitter:title, preview image headline and citation must STATE THE FINDING with a validated number, not name the topic.
Test: if someone reads only the title, do they know what the data says? "Climate finance: promised vs delivered" fails; "Rich countries delivered $136.7 billion. The poorest got 7%." passes.
- h1: 1-2 short sentences, max ~12 words each, the key number or contrast highlighted in <em class="serif">.
- Card/registry title: the same finding in under ~70 characters. The homepage hero "Latest" tile (.b-main: .b-title, mini chart, legend, source line) must use the same finding headline and a mini chart that shows that finding.
- The headline must match the main message of the preview image and the LinkedIn hook.
- Never let the headline imply the opposite of the finding (e.g. leading with a bigger promise when the story is under-delivery).

## Link previews stay fresh (required)
- Every preview image has a unique file name (og.jpg for a new issue; if it ever changes, og-v2.jpg, og-v3.jpg …). Never overwrite an existing preview image under the same name: LinkedIn, Facebook and WhatsApp cache images by URL.
- Whenever a headline changes, update og:title, twitter:title, og:image:alt AND re-render the preview image under a new file name in the same commit.

## Theme: dark frame + light content (Nov 2026, replaces "dark default")
- Default view = LIGHT content with an always-DARK frame: nav, homepage hero (.hero), dashboard headline area (.d-hero), closing CTA (.closing) and footer. The frame tokens live in assets/site.css ("Dark frame + light content").
- The toggle switches the content to full dark (localStorage theme="dark"). The theme script in every page head: data-theme = "dark" only if localStorage says "dark", otherwise "light".
- Every issue page must define its dark accent for the hero: on :root add --issue-d and --issue-d-rgb (the dark-mode values of --issue), e.g. :root{--issue-d:#6fd685;--issue-d-rgb:111,214,133;--issue:#2f8a3e;...}.
- Homepage hero tiles using an accent class need a dark value inside .hero (e.g. .hero .acc-green{--a:#6fd685;--a-rgb:111,214,133}).
- Check every new page in BOTH modes: light (default) and dark (toggle).
