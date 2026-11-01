/* =========================================================
   หน้าผลลัพธ์ "นี่คือร้านอาหารของคุณ !!"
   ลำดับ: การ์ดร้าน + แผนที่ → การ์ดเหตุผล (แมตช์ % | ทำไมถึงเป็นร้านนี้ | แก๊งนี้) → บรรยากาศ + เมนู
   หัวหน้า: ปุ่มลูกเต๋าใหญ่ + จานอาหาร (เหมือนหน้าสุ่มเลย) — กด = สุ่มใหม่ (ตัดร้านนี้ออก)
   ปุ่มลูกเต๋าลอย (ทุกขนาดจอ) โผล่เมื่อเลื่อนพ้นปุ่มใหญ่ · ลากไปวางตรงไหนก็ได้ เบราว์เซอร์จำตำแหน่งไว้
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
        <div class="why-col why-gang"><div class="why-gang-in">
          <h3>${icon('users')} ${title}</h3>
          ${gang ? `<p class="gang-sum">${gang.counts ? `<b>${gang.counts}</b>${gang.unknown ? ` · ไม่ระบุ MBTI ${gang.unknown}` : ''}<br>` : ''}${esc(gang.text)}</p>`
                 : '<p class="gang-sum hint">ยังไม่มีใครระบุ MBTI</p>'}
          <div class="gang-list">${p.map((x) => `
            <button class="gang-person" data-person="${x.id}" title="ดูโปรไฟล์">${avatarHTML(x)}
              <span class="gp-name">${esc(x.display_name)}${x.id === me.id ? ' (ฉัน)' : ''}</span>${mbtiBadge(x.mbti)}</button>`).join('')}</div>
        </div></div>
      </section>`;
  }

  const plates = [
    { t: '6%', l: '-7%', s: 120, mt: '2%', ml: '-6%', ms: 64 },
    { t: '-2%', l: '42%', s: 84, mt: '-2%', ml: '80%', ms: 58 },
    { t: '52%', l: '33%', s: 62, mt: '30%', ml: '2%', ms: 46 },
    { t: '4%', l: '93%', s: 76, mt: '34%', ml: '85%', ms: 50 },
    { t: '58%', l: '97%', s: 60, mt: '0', ml: '0', ms: 0 },
  ];
  function render() {
    const r = KRD.getRestaurant(state.current.id);
    if (!r) { location.replace('index.html'); return; }
    const page = document.getElementById('page');
    page.innerHTML = `
      <div class="container">
        <section class="result-head">
          ${plates.map((f, i) => `<span class="food-deco" style="--t:${f.t};--l:${f.l};--s:${f.s}px;--mt:${f.mt};--ml:${f.ml};--ms:${f.ms}px">
            ${KRD.assetImg(`plates/plate${[1, 4, 6, 3, 7][i]}.png`, { emoji: '🍽️', lazy: false })}</span>`).join('')}
          <button class="dice-btn" id="reroll" aria-label="สุ่มใหม่"><span class="inner"><span class="dice-svg">${diceSVG(120)}</span><span class="label">สุ่มเลย !</span></span></button>
          <h1>นี่คือร้านอาหารของคุณ !!</h1>
        </section>
        ${KRD.detail.topHTML(r, { fav: favIds.includes(r.id) })}
        ${whyCardHTML()}
        ${KRD.detail.bottomHTML(r)}
      </div>`;
    page.querySelector('#reroll').addEventListener('click', reroll);
    if (fab) fab.remove();
    fab = KRD.fabDice({ onClick: reroll, watch: page.querySelector('#reroll') });
    KRD.detail.bindGallery(page, r);
    page.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', () => {
      const x = party().find((y) => y.id === b.dataset.person);
      if (x) KRD.people.personPopup(x);
    }));
  }

  let rolling = false, fab = null;
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
    await KRD.diceRoll();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    rolling = false;
  }

  render();
})();
