const puppeteer = require('puppeteer-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless:'new', args:['--no-sandbox'] });
  const p = await b.newPage();
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.setRequestInterception(true);
  p.on('request', r => { if (r.url().includes('supabase')) return r.abort(); r.continue(); });
  const settings = { membership_tiers: { tiers: [
    { id:'silver', tier:'Silver', name:'The Companion', price:250, discount:10, massages:2, hammams:0, foot:1, guest:0, priority:24 },
    { id:'gold', tier:'Gold', name:'The Sanctuary', price:350, discount:15, massages:6, hammams:1, foot:2, guest:1, priority:48 },
  ] } };
  await p.evaluateOnNewDocument((s)=>{ try{ localStorage.setItem('taj-settings', JSON.stringify(s)); localStorage.setItem('taj-cs-bypass','1'); }catch(e){} }, settings);
  await p.goto('http://localhost:8090/membership.html', { waitUntil:'networkidle2', timeout:30000 }).catch(e=>console.log('nav',e.message));
  await sleep(2500);
  const cards = await p.evaluate(()=>[...document.querySelectorAll('.mtier-grid .mtier')].map(c=>({
    tier: (c.querySelector('.mtier__tier')||{}).textContent,
    name: (c.querySelector('h3')||{}).textContent,
    price: (c.querySelector('.mtier__price')||{}).textContent.replace(/\s+/g,' ').trim(),
    perks: [...c.querySelectorAll('.mtier__perks li')].map(li=>li.textContent.trim()),
  })));
  console.log(JSON.stringify(cards, null, 1));
  console.log('JS ERRORS:', errs.length?errs.join(' | '):'none');
  await b.close();
})();
