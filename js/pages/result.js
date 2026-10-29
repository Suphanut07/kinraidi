/* =========================================================
   หน้าผลลัพธ์ "นี่คือร้านอาหารของคุณ !!"
   ลำดับ: การ์ดร้าน + แผนที่ → การ์ดเหตุผล (แมตช์ % | ทำไมถึงเป็นร้านนี้ | แก๊งนี้) → บรรยากาศ + เมนู
   ปุ่มลูกเต๋าลอย (ทุกขนาดจอ) = สุ่มใหม่ (ตัดร้านนี้ออก) · ลากไปวางตรงไหนก็ได้ เบราว์เซอร์จำตำแหน่งไว้
   บนมือถือ "สุ่มเลย !" ในเมนู ☰ ก็สุ่มใหม่ได้เหมือนกัน
   ========================================================= */
(async function () {
  const { icon, esc, diceSVG, avatarHTML, mbtiBadge, toast } = KRD;
  let state;
  try { state = JSON.parse(sessionStorage.getItem('krd_roll')); } catch {}

  const me = await KRD.boot('home', { onMobileReroll: () => reroll() });
  if (!me) { location.replace('login.html'); return; }
  if (!state || !state.current) { location.replace('index.html'); return; }

  let favIds = [];
  try { favIds = (await KRD.api.listFavorites()).map((f) => f.restaurant_id); } catch {}

  const party = () => [me, ...(state.party || [])];
  const note = state.note || state.search || '';

  function whyCardHTML() {
    const p = party();
    const gang = KRD.match.gangSummary(p);
    const title = state.groupName ? esc(state.groupName) : (p.length > 1 ? 'แก๊งนี้' : 'มื้อนี้ของคุณ');
    return `
      <section class="why-card card">
        <div class="why-col why-match">
          <div class="match-ring big" style="--p:${state.current.percent}"><div><b>${state.current.percent}%</b><small>แมตช์</small></div></div>
          <p>เข้ากับ${p.length > 1 ? `ทั้ง ${p.length} คน` : 'คุณ'}</p>
        </div>
        <div class="why-col why-reasons">
          <h3>${icon('star')} ทำไมถึงเป็นร้านนี้ ?</h3>
          <ul>${state.current.reasons.map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
          ${note ? `<p class="why-note">${icon('pencil')} สิ่งที่ขอ: “${esc(note)}”</p>` : ''}
        </div>
        <div class="why-col why-gang">
          <h3>${icon('users')} ${title}</h3>
          ${gang ? `<p class="gang-sum">${gang.counts ? `<b>${gang.counts}</b>${gang.unknown ? ` · ไม่ระบุ MBTI ${gang.unknown}` : ''}<br>` : ''}${esc(gang.text)}</p>`
                 : '<p class="gang-sum hint">ยังไม่มีใครระบุ MBTI</p>'}
          <div class="gang-list">${p.map((x) => `
            <button class="gang-person" data-person="${x.id}" title="ดูโปรไฟล์">${avatarHTML(x)}
              <span class="gp-name">${esc(x.display_name)}${x.id === me.id ? ' (ฉัน)' : ''}</span>${mbtiBadge(x.mbti)}</button>`).join('')}</div>
        </div>
      </section>`;
  }

  function render() {
    const r = KRD.getRestaurant(state.current.id);
    if (!r) { location.replace('index.html'); return; }
    const page = document.getElementById('page');
    page.innerHTML = `
      <div class="container">
        <section class="result-head"><h1>นี่คือร้านอาหารของคุณ !!</h1></section>
        ${KRD.detail.topHTML(r, { fav: favIds.includes(r.id) })}
        ${whyCardHTML()}
        ${KRD.detail.bottomHTML(r)}
      </div>`;
    KRD.detail.bindGallery(page, r);
    page.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', () => {
      const x = party().find((y) => y.id === b.dataset.person);
      if (x) KRD.people.personPopup(x);
    }));
  }

  let rolling = false;
  async function reroll() {
    if (rolling) return; rolling = true;
    state.exclude = [...new Set([...(state.exclude || []), state.current.id])];
    const opts = () => ({ exclude: state.exclude, note, location: state.location });
    let res = KRD.match.recommend(party(), state.conds || [], opts());
    if (!res) {
      // สุ่มครบทุกร้านแล้ว → เริ่มรอบใหม่ (แต่ไม่ให้ซ้ำร้านล่าสุด)
      state.exclude = [state.current.id];
      res = KRD.match.recommend(party(), state.conds || [], opts());
      toast('วนครบทุกร้านที่เข้าเงื่อนไขแล้ว เริ่มสุ่มรอบใหม่นะ');
    }
    if (!res) { toast('ไม่มีร้านอื่นที่เข้าเงื่อนไขแล้ว', 'error'); rolling = false; return; }
    state.current = { id: res.pick.id, percent: res.percent, reasons: res.reasons, relaxed: res.relaxed };
    sessionStorage.setItem('krd_roll', JSON.stringify(state));
    try { await KRD.api.addHistory(res.pick.id, party().map((x) => ({ id: x.id, name: x.display_name }))); } catch {}
    await KRD.diceRoll(1100);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    rolling = false;
  }

  /* ---------- ปุ่มลูกเต๋าลอย (ลากได้ / กด = สุ่มใหม่) ---------- */
  function floatingDice() {
    const KEY = 'krd_fab_pos';
    const fab = document.createElement('button');
    fab.className = 'fab-dice';
    fab.setAttribute('aria-label', 'สุ่มใหม่ (ลากเพื่อย้ายปุ่มได้)');
    fab.innerHTML = `<span class="fab-inner">${diceSVG(54)}<span>สุ่มเลย !</span></span>`;
    document.body.appendChild(fab);

    const size = () => fab.getBoundingClientRect();
    const clamp = (x, y) => {
      const r = size(), m = 8;
      return [Math.min(Math.max(m, x), innerWidth - r.width - m), Math.min(Math.max(m, y), innerHeight - r.height - m)];
    };
    const place = (x, y) => { [x, y] = clamp(x, y); fab.style.left = x + 'px'; fab.style.top = y + 'px'; return [x, y]; };
    // ตำแหน่งเก็บเป็นสัดส่วนของหน้าจอ (หมุนจอ/ย่อหน้าต่างแล้วยังอยู่ประมาณเดิม)
    const restore = () => {
      let pos = null;
      try { pos = JSON.parse(localStorage.getItem(KEY)); } catch {}
      const r = size();
      if (pos) place(pos.x * innerWidth, pos.y * innerHeight);
      else place(innerWidth - r.width - 20, innerHeight - r.height - 24);
    };
    restore();
    addEventListener('resize', restore);

    let start = null, moved = false;
    fab.addEventListener('pointerdown', (e) => {
      const r = size();
      start = { px: e.clientX, py: e.clientY, x: r.left, y: r.top };
      moved = false;
      fab.setPointerCapture(e.pointerId);
    });
    fab.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = e.clientX - start.px, dy = e.clientY - start.py;
      if (!moved && Math.hypot(dx, dy) < 6) return;   // ขยับนิดเดียว = ยังนับเป็นการกด
      moved = true;
      fab.classList.add('dragging');
      place(start.x + dx, start.y + dy);
    });
    const end = () => {
      if (!start) return;
      fab.classList.remove('dragging');
      if (moved) {
        const r = size();
        try { localStorage.setItem(KEY, JSON.stringify({ x: r.left / innerWidth, y: r.top / innerHeight })); } catch {}
      } else reroll();
      start = null;
    };
    fab.addEventListener('pointerup', end);
    fab.addEventListener('pointercancel', () => { start = null; fab.classList.remove('dragging'); });
    fab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reroll(); } });

    // ครั้งแรกบอกว่าลากได้
    let seen = false;
    try { seen = localStorage.getItem('krd_fab_tip') === '1'; localStorage.setItem('krd_fab_tip', '1'); } catch {}
    if (!seen) {
      const tip = document.createElement('div');
      tip.className = 'fab-tip';
      tip.textContent = 'กดเพื่อสุ่มใหม่ · ลากไปวางตรงไหนก็ได้';
      document.body.appendChild(tip);
      const r = size();
      tip.style.left = Math.min(innerWidth - 248, Math.max(8, r.left + r.width / 2 - 120)) + 'px';
      tip.style.top = (r.top > 70 ? r.top - 60 : r.bottom + 10) + 'px';
      setTimeout(() => tip.remove(), 4500);
    }
  }

  render();
  floatingDice();
})();
