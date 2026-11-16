#!/usr/bin/env python3
"""Builds /feed.xml (RSS) from every dashboard: title = headline, body = 3 key takeaways + link.
Buttondown watches this feed and emails new items to subscribers. Run after adding a dashboard."""
import re,os,glob,html,datetime,email.utils
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SITE='https://nafiulazim.com'
items=[]
for d in sorted(glob.glob(f'{ROOT}/devdataweekly/issues/*/'),reverse=True):
    slug=os.path.basename(d.rstrip('/'));s=open(d+'index.html',encoding='utf-8').read()
    h1=html.unescape(re.sub(r'<[^>]+>','',re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S).group(1))).strip()
    tk=re.search(r'class="panel takeaways[^>]*>.*?<ol>(.*?)</ol>',s,re.S)
    lis=re.findall(r'<li>(.*?)</li>',tk.group(1),re.S) if tk else []
    url=f'{SITE}/devdataweekly/issues/{slug}/'
    n=len(glob.glob(f'{ROOT}/devdataweekly/issues/*/'))-len(items)
    dt=datetime.datetime.strptime(slug[:10],'%Y-%m-%d').replace(hour=5,tzinfo=datetime.timezone.utc)
    body=(f'<p><b>Dev Data Weekly #{n:02d}</b></p><p><b>Key takeaways</b></p><ol>'+''.join(f'<li>{l}</li>' for l in lis)+'</ol>'
          f'<p>Hover or tap any chart for the exact value and source. Every number is linked to its original report, and there is a free one-page brief to download.</p>'
          f'<p><a href="{url}">Open the interactive dashboard →</a></p><p><i>A personal project by Nafiul Azim. Views my own.</i></p>')
    items.append(f'<item><title>{html.escape(h1)}</title><link>{url}</link><guid isPermaLink="true">{url}</guid><pubDate>{email.utils.format_datetime(dt)}</pubDate><description><![CDATA[{body}]]></description></item>')
open(f'{ROOT}/feed.xml','w',encoding='utf-8').write(f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Nafiul Azim · Data Stories</title><link>{SITE}/</link><description>One interactive development-data dashboard every week. Every number cited.</description><language>en</language>
<atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>
{chr(10).join(items)}
</channel></rss>''')
print('feed.xml:',len(items),'items')
