#!/usr/bin/env python3
"""Consistency check for a Dev Data Weekly issue. Usage: python3 tools/check_numbers.py <issue-slug>
Fails (exit 1) if any number shown in headline, takeaways, og/twitter tags, homepage card/tile or data.csv
does not appear in the page's data-tip texts, or if any data-tip lacks a data-src."""
import re,sys,html,csv,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def nums(t):
    t=html.unescape(re.sub(r'<[^>]+>',' ',t)).replace(',','')
    t=re.sub(r'\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*','',t)   # dates
    t=re.sub(r'#\d+','',t)                                                                 # issue numbers
    out=set()
    for n in re.findall(r'(?<![\w.])\d+(?:\.\d+)?',t):
        if re.fullmatch(r'(19|20)\d\d',n): continue          # years
        if n in ('0','1','2','3','4','5'): continue          # tiny counters / issue numbers
        out.add(n.rstrip('0').rstrip('.') if '.' in n else n)
    return out
def rendered_tips(slug):
    """data-tips created by the page's chart JavaScript (needs playwright)."""
    try:
        import asyncio,http.server,threading,functools
        from playwright.async_api import async_playwright
    except ImportError:
        print('  (playwright missing: only static data-tips checked)');return []
    http.server.SimpleHTTPRequestHandler.log_message=lambda *a:None
    srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    async def go():
        async with async_playwright() as p:
            b=await p.chromium.launch();pg=await b.new_page()
            await pg.goto(f'http://127.0.0.1:{srv.server_port}/devdataweekly/issues/{slug}/');await pg.wait_for_timeout(1200)
            r=await pg.evaluate("[...document.querySelectorAll('[data-tip]')].map(e=>e.dataset.tip+(e.dataset.src?'':' @@NOSRC'))");await b.close();return r
    r=asyncio.run(go());srv.shutdown()
    for t in r:
        if t.endswith('@@NOSRC'): print('  ✗ rendered data-tip without data-src:',t[:80])
    return [t.replace(' @@NOSRC','') for t in r]
def main(slug):
    d=f'{ROOT}/devdataweekly/issues/{slug}/';s=open(d+'index.html',encoding='utf-8').read()
    tags=re.findall(r'<[^>]*data-tip="([^"]*)"[^>]*>',s)
    tags+=rendered_tips(slug)
    nosrc=[m for m in re.findall(r'<[^>]*data-tip="[^"]*"[^>]*>',s) if 'data-src="' not in m and '${' not in m]
    js_tips=re.findall(r'data-tip="([^"]*\$\{[^"]*)"',s)
    tipnums=set().union(*[nums(t) for t in tags]) if tags else set()
    # numbers living in JS data arrays (chart data) count as tip numbers too
    for blk in re.findall(r'<script>(.*?)</script>',s,flags=re.S): tipnums|=nums(blk)
    checks={}
    h1=re.search(r'<h1[^>]*>(.*?)</h1>',s,flags=re.S); checks['h1 headline']=h1.group(1) if h1 else ''
    checks['takeaways']=' '.join(re.findall(r'<section[^>]*takeaways-sec.*?</section>',s,flags=re.S))
    for k in ['og:title','og:description','twitter:title','twitter:description','og:image:alt']:
        m=re.search(r'(?:property|name)="%s" content="([^"]*)"'%re.escape(k),s); checks[k]=m.group(1) if m else ''
    home=open(f'{ROOT}/index.html',encoding='utf-8').read()
    url=f'/devdataweekly/issues/{slug}/'
    for m in re.finditer(r'<a class="panel[^"]*"[^>]*href="%s"[^>]*>(.*?)</a>'%re.escape(url),home,flags=re.S): checks['homepage card/tile']=checks.get('homepage card/tile','')+m.group(1)
    bad=[]
    for where,txt in checks.items():
        for n in sorted(nums(txt)-tipnums): bad.append(f'{where}: "{n}" is not in any data-tip')
    if os.path.exists(d+'data.csv'):
        for r in list(csv.reader(open(d+'data.csv',encoding='utf-8-sig')))[1:]:
            if len(r)>1:
                v=r[1].rstrip('0').rstrip('.') if '.' in r[1] else r[1]
                v=v.lstrip('-')
                if v not in tipnums and str(float(v)*1000).rstrip('0').rstrip('.') not in tipnums and str(round(float(v)/1000,1)).rstrip('0').rstrip('.') not in tipnums:
                    bad.append(f'data.csv: {r[0]} = {r[1]} not found in data-tips')
    for m in nosrc: bad.append('data-tip without data-src: '+m[:90])
    print(f'{slug}: {len(tags)} data-tips, {len(bad)} problem(s)')
    for b in bad: print('  ✗',b)
    return 1 if bad else 0
sys.exit(max(main(a) for a in sys.argv[1:]))
