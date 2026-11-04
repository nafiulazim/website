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
