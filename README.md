# nafiulazim.com

Personal site and passion project: weekly dashboards on global development data.

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
- Right after `</header>`: a `.takeaways` section with exactly 3 one-line takeaways, using only figures that appear on the page with data-tip/data-src.
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
Every dashboard headline (h1), homepage card title, registry title, <title>, og:title/twitter:title, preview image headline and citation must STATE THE FINDING with a validated number, not name the topic.
Test: if someone reads only the title, do they know what the data says? "Climate finance: promised vs delivered" fails; "Rich countries delivered $136.7 billion. The poorest got 7%." passes.
- h1: 1-2 short sentences, max ~12 words each, the key number or contrast highlighted in <em class="serif">.
- Card/registry title: the same finding in under ~70 characters.
- The headline must match the main message of the preview image and the LinkedIn hook.
- Never let the headline imply the opposite of the finding (e.g. leading with a bigger promise when the story is under-delivery).
