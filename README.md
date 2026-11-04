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
