# Builds chart PNGs + one-page brief PDF for an issue. Usage: python3 assets_build.py <issue-slug> [<issue-slug>...]
import asyncio,http.server,threading,functools,sys,re,html,os
from playwright.async_api import async_playwright
ROOT='/home/claude/website'
http.server.SimpleHTTPRequestHandler.log_message=lambda *a:None
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8772),functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
B='http://127.0.0.1:8772'
MARK_JS="""() => {
 const ps=[...document.querySelectorAll('.panel')].filter(p=>p.querySelector('h2,h3')&&p.querySelectorAll('[data-tip]').length>=2&&!p.closest('.panel:not(:scope) .panel'));
 return ps.map((p,i)=>{p.setAttribute('data-shot',i+1);const t=p.querySelector('h2,h3').textContent.trim();
  const src=[...new Set([...p.querySelectorAll('[data-src]')].map(e=>e.dataset.src.split(/[;(,]/)[0].replace(/^Calculated from /,'').trim()))].slice(0,3).join('; ');return {i:i+1,t,src}});}"""
async def run(slugs):
 async with async_playwright() as p:
  b=await p.chromium.launch()
  for k in slugs:
   d=f'{ROOT}/devdataweekly/issues/{k}/';os.makedirs(d+'charts',exist_ok=True)
   pg=await b.new_page(viewport={'width':1100,'height':900},device_scale_factor=2)
   await pg.add_init_script("try{localStorage.setItem('theme','light')}catch(e){}")
   await pg.goto(B+f'/devdataweekly/issues/{k}/');await pg.wait_for_timeout(600)
   await pg.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));window.scrollTo(0,document.body.scrollHeight)");await pg.wait_for_timeout(2500)
   await pg.evaluate("window.scrollTo(0,0)");await pg.wait_for_timeout(300)
   info=await pg.evaluate(MARK_JS)
   title=await pg.evaluate("document.querySelector('h1').textContent.trim()")
   n=re.search(r'#(\d+)',await pg.evaluate("document.title+' '+document.body.innerText.slice(0,400)"))
   num=n.group(1) if n else ''
   await pg.add_style_tag(content=".shot-foot{display:flex;justify-content:space-between;gap:16px;margin-top:18px;padding-top:12px;border-top:1px solid var(--line);font:500 13px var(--body);color:var(--muted)} .shot-foot b{color:var(--fg)} [data-shot] .chart-dl{display:none!important} .nav{display:none!important}")
   for c in info:
    await pg.evaluate("""([i,s])=>{const p=document.querySelector(`[data-shot="${i}"]`);const f=document.createElement('div');f.className='shot-foot';f.innerHTML=`<span>Source: ${s}</span><span><b>nafiulazim.com</b> · Dev Data Weekly</span>`;p.appendChild(f);p.style.transform='none';p.style.opacity='1';const g=p.parentElement;g.dataset.oldStyle=g.getAttribute('style')||'';g.style.display='block';p.style.width='900px';p.style.maxWidth='none';window.dispatchEvent(new Event('resize'))}""",[c['i'],html.escape(c['src'])])
    el=pg.locator(f'[data-shot="{c["i"]}"]');await el.scroll_into_view_if_needed();await pg.wait_for_timeout(1800)
    await el.screenshot(path=d+f'charts/chart-{c["i"]}.png')
    await pg.evaluate("i=>{const p=document.querySelector(`[data-shot=\"${i}\"]`);p.querySelector('.shot-foot').remove();p.style.width='';p.parentElement.setAttribute('style',p.parentElement.dataset.oldStyle);window.dispatchEvent(new Event('resize'))}",c['i'])
   tk=await pg.evaluate("[...document.querySelectorAll('.takeaways li')].map(l=>l.innerHTML)")
   lede=await pg.evaluate("document.querySelector('.lede')?.textContent.trim()||''")
   date=await pg.evaluate("(document.querySelector('.metaline .pill')?.textContent||'').replace('Data compiled','').trim()")
   srcs=await pg.evaluate("[...document.querySelectorAll('.sources a[href^=http]')].filter(a=>!a.href.includes('linkedin')).map(a=>a.textContent.trim())")
   await pg.close()
   url=f'https://nafiulazim.com/devdataweekly/issues/{k}/'
   imgs=''.join(f'<figure><img src="charts/chart-{c["i"]}.png"></figure>' for c in info[:2])
   brief=f'''<!doctype html><html><head><meta charset="utf-8"><style>
@page{{size:A4;margin:0}}*{{box-sizing:border-box;margin:0}}body{{width:210mm;height:297mm;padding:13mm 14mm 11mm;font-family:Geist,"Segoe UI",Arial,sans-serif;color:#0c1626;display:flex;flex-direction:column;gap:5mm;font-size:10pt;line-height:1.45}}
.top{{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0c1626;padding-bottom:3mm}}.brand{{display:flex;align-items:center;gap:8px;font-weight:800;font-size:12pt}}.brand i{{width:26px;height:26px;border-radius:7px;background:#131c2c;color:#7fe0d8;font:700 9pt Arial;display:grid;place-items:center;font-style:normal}}
.kick{{font:600 8pt monospace;letter-spacing:.12em;text-transform:uppercase;color:#0a8f88}}h1{{font-size:20pt;line-height:1.12;letter-spacing:-.02em;margin-top:1.5mm}}.lede{{color:#4d5b70;margin-top:2mm}}
.tk{{background:#f2f5f8;border-left:3px solid #0a8f88;padding:4mm 5mm;border-radius:2mm}}.tk ol{{padding-left:5mm;display:grid;gap:1.5mm}}.tk h2,.src h2{{font:700 8pt monospace;letter-spacing:.1em;text-transform:uppercase;color:#4d5b70;margin-bottom:2mm}}
.figs{{display:grid;gap:4mm;flex:1;min-height:0;grid-template-rows:1fr 1fr}}figure{{min-height:0;display:flex;justify-content:center}}figure img{{max-width:100%;max-height:100%;object-fit:contain;border:1px solid #e3e8ef;border-radius:2mm}}
.src{{font-size:7.6pt;color:#4d5b70}}.src p{{columns:2;column-gap:6mm}}.foot{{display:flex;justify-content:space-between;font-size:7.6pt;color:#7a879a;border-top:1px solid #e3e8ef;padding-top:2mm}}.foot b{{color:#0c1626}}
</style></head><body>
<div class="top"><div class="brand"><i>NA</i>Nafiul Azim · Data Stories</div><div class="kick">Dev Data Weekly #{num} · {html.escape(date)}</div></div>
<div><div class="kick">One-page brief</div><h1>{html.escape(title)}</h1><p class="lede">{html.escape(lede)}</p></div>
<div class="tk"><h2>Key takeaways</h2><ol>{''.join(f"<li>{t}</li>" for t in tk)}</ol></div>
<div class="figs">{imgs}</div>
<div class="src"><h2>Sources</h2><p>{' · '.join(html.escape(s) for s in srcs)}</p></div>
<div class="foot"><span>Interactive version, full data and all sources: <b>{url}</b></span><span>Personal project · views my own</span></div>
</body></html>'''
   open(d+'brief.html','w').write(brief)
   pg=await b.new_page();await pg.goto(B+f'/devdataweekly/issues/{k}/brief.html');await pg.wait_for_timeout(800)
   await pg.pdf(path=d+'brief.pdf',format='A4',print_background=True,prefer_css_page_size=True)
   await pg.close();os.remove(d+'brief.html')
   print(k,'charts:',[(c['i'],c['t']) for c in info])
  await b.close()
asyncio.run(run(sys.argv[1:]))
