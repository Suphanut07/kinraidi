/* =========================================================
   หน้าหลัก: สุ่มร้าน / มื้อนี้ไปกับใคร / เงื่อนไข / รายละเอียดเพิ่มเติม / ร้านแนะนำ
   - วงกลมโปรไฟล์ว่าง → popup รายชื่อสมาชิก (เลือกเพื่อนเข้ามื้อ)
   - ปุ่ม +          → popup "มาจอยกัน !" (สแกน QR / QR ของฉัน / รหัสเพื่อน)
   - กด "QR ของฉัน"   → เป็นหัวทีม: คนที่สแกนจะถูกดึงเข้าตี้อัตโนมัติ (เด้งโปรไฟล์ทีละคน)
   - ปุ่มลูกเต๋าลอย  → โผล่เมื่อเลื่อนจนปุ่มสุ่มใหญ่พ้นจอ
   - กดรูปคนในตี้     → ดูโปรไฟล์ + ปุ่มเอาออกจากมื้อนี้
   ========================================================= */
(async function () {
  const { icon, esc, diceSVG, avatarHTML, mbtiBadge, restaurantCard, bindFavButtons, openModal, toast } = KRD;
  const me = await KRD.boot('home');
  const NOTE_MAX = 100;

  /* ---------- state (เก็บใน sessionStorage ให้กลับมาหน้านี้แล้วยังอยู่) ---------- */
  const S = {
    get party() { try { return JSON.parse(sessionStorage.getItem('krd_party')) || []; } catch { return []; } },
    set party(v) { sessionStorage.setItem('krd_party', JSON.stringify(v)); },
    get conds() { try { return (JSON.parse(sessionStorage.getItem('krd_conds')) || []).filter((k) => window.CONDITIONS.some((c) => c.key === k)); } catch { return []; } },
    set conds(v) { sessionStorage.setItem('krd_conds', JSON.stringify(v)); },
    get note() { return sessionStorage.getItem('krd_note') || ''; },
    set note(v) { sessionStorage.setItem('krd_note', v); },
  };
  let friends = [], groups = [], favIds = [];
  if (me) {
    try { [friends, groups, favIds] = await Promise.all([KRD.api.listFriends(), KRD.api.listGroups(), KRD.api.listFavorites().then((l) => l.map((f) => f.restaurant_id))]); }
    catch (e) { toast(e.message, 'error'); }
    // อัปเดตข้อมูลเพื่อนในตี้ให้เป็นล่าสุด (เผื่อเพื่อนแก้ MBTI/สิ่งที่ชอบ)
    const fresh = await KRD.api.getProfiles(S.party.map((p) => p.id)).catch(() => []);
    if (fresh.length) S.party = S.party.map((p) => fresh.find((f) => f.id === p.id) || p);
  }

  /* ---------- layout ---------- */
  // จานอาหารตกแต่ง (รูปจากทีม assets/plates/plate1-7.png) — ตำแหน่งคอม/แท็บเล็ต (t,l,s) และมือถือ (mt,ml,ms; ms=0 คือซ่อน)
  const plates = [
    { t: '0%', l: '50%', s: 84, mt: '-1%', ml: '-5%', ms: 62 },
    { t: '20%', l: '58%', s: 66, mt: '0%', ml: '83%', ms: 58 },
    { t: '-4%', l: '75%', s: 90, mt: '46%', ml: '86%', ms: 48 },
    { t: '0%', l: '92%', s: 84, mt: '50%', ml: '-1%', ms: 66 },
    { t: '28%', l: '84%', s: 110, mt: '66%', ml: '77%', ms: 68 },
    { t: '47%', l: '95%', s: 84, mt: '83%', ml: '5%', ms: 52 },
    { t: '60%', l: '86%', s: 130, mt: '86%', ml: '86%', ms: 46 },
    { t: '84%', l: '61%', s: 72, mt: '0', ml: '0', ms: 0 },
    { t: '84%', l: '75%', s: 86, mt: '0', ml: '0', ms: 0 },
    { t: '90%', l: '52%', s: 66, mt: '0', ml: '0', ms: 0 },
  ];
  document.getElementById('page').innerHTML = `
    <section class="hero">
      ${plates.map((f, i) => `<span class="food-deco" style="--t:${f.t};--l:${f.l};--s:${f.s}px;--mt:${f.mt};--ml:${f.ml};--ms:${f.ms}px">
          ${KRD.assetImg(`plates/plate${(i % 7) + 1}.png`, { emoji: '🍽️', lazy: false })}</span>`).join('')}
      <div class="container">
        <div>
          <h1>กินรัยดี !</h1>
          <p class="sub">ไม่รู้ว่าจะกินอะไรหรอ มาเลยเดี๋ยวสุ่มให้</p>
        </div>
        <button class="dice-btn" id="roll" aria-label="สุ่มเลย"><span class="inner"><span class="dice-svg">${diceSVG(120)}</span><span class="label">สุ่มเลย !</span></span></button>
      </div>
    </section>

    <div class="container">
      <section class="home-controls">
        <div>
          <h2>มื้อนี้ไปกับใคร ?</h2>
          <div id="party-area"></div>
        </div>
        <div>
          <h2>เงื่อนไข</h2>
          <div class="cond-grid" id="conds">
            ${window.CONDITIONS.map((c) => `<button class="chip" data-cond="${c.key}">${c.label}</button>`).join('')}
          </div>
          <div class="note-box">
            <label for="note">${icon('pencil')} รายละเอียดเพิ่มเติม <span class="hint">(ไม่บังคับ)</span></label>
            <textarea id="note" class="input" rows="3" maxlength="${NOTE_MAX}" placeholder="บอกความอยากของมื้อนี้ เช่น อยากซดน้ำร้อนๆ, ไม่เอาเผ็ด, อยากนั่งชิลถ่ายรูปสวย">${esc(S.note)}</textarea>
            <span class="counter" id="note-cnt">${S.note.length}/${NOTE_MAX}</span>
          </div>
        </div>
      </section>

      <h2 class="section-title">ร้านอาหารแนะนำใกล้คุณ</h2>
      <div class="scroller-wrap">
        <button class="scroll-prev" aria-label="ก่อนหน้า">${icon('chevronLeft')}</button>
        <div class="scroller" id="scroller"></div>
        <button class="scroll-next" aria-label="ถัดไป">${icon('chevronRight')}</button>
      </div>
    </div>`;

  /* ---------- เงื่อนไข ---------- */
  const condWrap = document.getElementById('conds');
  const paintConds = () => condWrap.querySelectorAll('[data-cond]').forEach((b) => b.classList.toggle('on', S.conds.includes(b.dataset.cond)));
  paintConds();
  condWrap.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cond]'); if (!b) return;
    const k = b.dataset.cond;
    const set = new Set(S.conds);
    set.has(k) ? set.delete(k) : set.add(k);
    S.conds = [...set];
    if (k === 'near' && set.has(k)) getLocation();
    paintConds();
  });

  /* ---------- รายละเอียดเพิ่มเติม (เอาไปประมวลผลตอนสุ่ม) ---------- */
  const noteInp = document.getElementById('note');
  noteInp.addEventListener('input', () => {
    S.note = noteInp.value.slice(0, NOTE_MAX);
    document.getElementById('note-cnt').textContent = `${noteInp.value.length}/${NOTE_MAX}`;
  });

  let userLoc = null;
  try { userLoc = JSON.parse(sessionStorage.getItem('krd_loc')); } catch {}
  function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      userLoc = { lat: p.coords.latitude, lng: p.coords.longitude };
      // ถ้าอยู่ไกลจากมหาลัยเกิน 30 กม. ใช้พิกัดมหาลัยแทน (ข้อมูลร้านมีแค่แถวนี้)
      if (KRD.match.distanceKm(userLoc, KRD_CONFIG.CAMPUS) > 30) userLoc = null;
      sessionStorage.setItem('krd_loc', JSON.stringify(userLoc));
      renderNearby();
    }, () => {}, { timeout: 8000 });
  }

  /* ---------- ร้านแนะนำใกล้คุณ ---------- */
  function renderNearby() {
    const origin = userLoc || KRD_CONFIG.CAMPUS;
    const list = window.RESTAURANTS.slice().sort((a, b) => KRD.match.distanceKm(origin, a) - KRD.match.distanceKm(origin, b));
    const sc = document.getElementById('scroller');
    sc.innerHTML = list.map((r) => restaurantCard(r, { fav: favIds.includes(r.id) })).join('');
    if (me) bindFavButtons(sc);
    else sc.querySelectorAll('[data-fav]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); location.href = 'login.html'; }));
  }
  renderNearby();
  const sc = document.getElementById('scroller');
  document.querySelector('.scroll-next').onclick = () => sc.scrollBy({ left: sc.clientWidth * 0.8, behavior: 'smooth' });
  document.querySelector('.scroll-prev').onclick = () => sc.scrollBy({ left: -sc.clientWidth * 0.8, behavior: 'smooth' });

  /* ---------- มื้อนี้ไปกับใคร ---------- */
  const partyArea = document.getElementById('party-area');
  let selectedGroup = null;

  function renderParty() {
    if (!me) {
      partyArea.innerHTML = `<div class="login-cta"><p>เข้าสู่ระบบเพื่อชวนเพื่อนหรือเลือกกลุ่มมาสุ่มร้านด้วยกัน</p>
        <a class="btn btn-primary" href="login.html">เข้าสู่ระบบ</a></div>`;
      return;
    }
    const party = S.party;
    partyArea.innerHTML = `
      <div class="party">
        <button class="slot" data-person="${me.id}" title="${esc(me.display_name)} (คุณ)">${avatarHTML(me)}<span class="me-tag">ฉัน</span></button>
        ${party.map((p) => `<button class="slot" data-person="${p.id}" title="ดูโปรไฟล์ ${esc(p.display_name)}">${avatarHTML(p)}</button>`).join('')}
        <button class="slot" data-pick title="เลือกจากรายชื่อสมาชิก">${avatarHTML(null)}</button>
        <button class="add-btn" id="join-btn" title="มาจอยกัน ! (สแกน QR / รหัสเพื่อน)" aria-label="ชวนเพื่อนมาจอย">${icon('plus')}</button>
      </div>
      <p class="party-name">${party.length ? `ไปกันทั้งหมด ${party.length + 1} คน · กดที่รูปเพื่อดูโปรไฟล์` : 'ยังไม่ได้เลือกใคร = สุ่มสำหรับคุณคนเดียว'}</p>
      <div class="group-select">
        <button id="group-btn" type="button">
          ${selectedGroup ? groupAvatar(selectedGroup) : avatarHTML(null)}
          <span class="g-name">${selectedGroup ? esc(selectedGroup.name) : 'เลือกกลุ่ม'}</span>
          <span class="caret">${icon('chevronDown')}</span>
        </button>
      </div>`;
    partyArea.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', () => openPerson(b.dataset.person)));
    partyArea.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', openFriendPicker));
    document.getElementById('join-btn').addEventListener('click', () =>
      KRD.people.joinPopup(me, { mode: 'meal', onAdded: (p) => { selectedGroup = null; addToParty([p]); if (!friends.some((f) => f.id === p.id)) friends.push(p); } }));
    document.getElementById('group-btn').addEventListener('click', openGroupMenu);
  }
  function groupAvatar(g) {
    return g.photo_url ? `<span class="avatar"><img src="${esc(g.photo_url)}" alt=""></span>` : `<span class="avatar"><span class="initial">${esc(g.name.charAt(0))}</span></span>`;
  }
  function addToParty(profiles) {
    const cur = S.party;
    profiles.forEach((p) => { if (p && p.id !== me.id && !cur.some((c) => c.id === p.id)) cur.push(p); });
    S.party = cur; renderParty();
  }
  renderParty();

  // กดรูปในตี้ → ดูโปรไฟล์ (+ เอาออกจากมื้อนี้)
  function openPerson(id) {
    const p = id === me.id ? me : S.party.find((x) => x.id === id);
    if (!p) return;
    const actions = id === me.id ? [{ label: 'แก้ไขโปรไฟล์ของฉัน', icon: 'pencil', cls: 'btn-primary', onClick: () => (location.href = 'profile.html') }]
      : [{ label: 'เอาออกจากมื้อนี้', icon: 'x', cls: 'btn-danger', onClick: (close) => {
          S.party = S.party.filter((x) => x.id !== id); selectedGroup = null; renderParty(); close();
          toast(`เอา ${p.display_name} ออกจากมื้อนี้แล้ว`);
        } }];
    KRD.people.personPopup(p, { actions });
  }

  // dropdown เลือกกลุ่ม
  function openGroupMenu() {
    const wrap = document.querySelector('.group-select');
    if (wrap.querySelector('.group-menu')) return;
    const m = document.createElement('div');
    m.className = 'group-menu';
    m.innerHTML = `<button class="caret close-menu" aria-label="ปิด">${icon('chevronDown')}</button>
      ${groups.length ? groups.map((g) => `<button class="item" data-g="${g.id}">${groupAvatar(g)}<span>${esc(g.name)}<br><small>${g.members.length} คน</small></span></button>`).join('')
        : '<p style="padding:8px;margin:0;font-size:14px">ยังไม่มีกลุ่ม</p>'}
      <a class="more" href="member.html">เพิ่มเติม . . .</a>`;
    wrap.appendChild(m);
    const close = () => { m.remove(); document.removeEventListener('click', outside); };
    const outside = (e) => { if (!wrap.contains(e.target)) close(); };
    setTimeout(() => document.addEventListener('click', outside));
    m.querySelector('.close-menu').onclick = close;
    m.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => {
      selectedGroup = groups.find((g) => g.id === b.dataset.g);
      S.party = [];
      addToParty(selectedGroup.members);
      close(); toast(`เลือกกลุ่ม "${selectedGroup.name}" แล้ว`);
    }));
  }

  // popup รายชื่อสมาชิก (เลือกเพื่อนเข้ามื้อ)
  function openFriendPicker() {
    const inParty = (id) => S.party.some((p) => p.id === id);
    const btnHTML = (on) => `${icon(on ? 'check' : 'plusCircle')} <span>${on ? 'เพิ่มแล้ว' : 'เพิ่ม'}</span>`;
    openModal({
      title: 'รายชื่อสมาชิก', iconName: 'user',
      body: friends.length ? `<div class="pick-list">${friends.map((f) => `
          <div class="pick-row"><button class="who-btn" data-view="${f.id}">${avatarHTML(f)}<span class="who"><strong>${esc(f.display_name)}</strong>${mbtiBadge(f.mbti)}</span></button>
          <button class="add ${inParty(f.id) ? 'on' : ''}" data-pick="${f.id}">${btnHTML(inParty(f.id))}</button></div>`).join('')}</div>
          <div class="modal-actions"><button class="btn" data-join>${icon('plus')} เพิ่มเพื่อนใหม่</button><button class="btn btn-primary" data-done>เสร็จสิ้น</button></div>`
        : `<div class="empty-state"><div class="big">👥</div><h3>ยังไม่มีเพื่อนเลย</h3><p>กดปุ่มด้านล่างเพื่อเพิ่มเพื่อนด้วย QR หรือรหัสเพื่อน</p><br><button class="btn btn-primary" data-join>${icon('plus')} เพิ่มเพื่อน</button></div>`,
      onMount(el, close) {
        el.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.pick;
          if (inParty(id)) S.party = S.party.filter((p) => p.id !== id);
          else addToParty([friends.find((f) => f.id === id)]);
          b.classList.toggle('on', inParty(id));
          b.innerHTML = btnHTML(inParty(id));
          selectedGroup = null; renderParty();
        }));
        el.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => KRD.people.personPopup(friends.find((f) => f.id === b.dataset.view))));
        const d = el.querySelector('[data-done]'); if (d) d.onclick = close;
        el.querySelectorAll('[data-join]').forEach((b) => (b.onclick = () => { close(); document.getElementById('join-btn').click(); }));
      },
    });
  }

  /* ---------- หัวทีมรับคนที่สแกน QR เข้ามื้อ ----------
     เริ่มเมื่อกด "QR ของฉัน" ในหน้านี้ แล้วรับต่อไปเรื่อยๆ ตราบที่ยังอยู่หน้าสุ่มเลย
     มีคนเข้ามา → เพิ่มเข้าตี้ + เด้งโปรไฟล์ทีละคน */
  const HOST_KEY = 'krd_host_since', SEEN_KEY = 'krd_host_seen';
  let hostTimer = null;
  const queue = []; let showing = false;
  function showNextJoiner() {
    if (showing || !queue.length) return;
    showing = true;
    const p = queue.shift();
    KRD.people.successPopup(p, { title: 'มีคนเข้าร่วม !', text: `<b>${esc(p.display_name)}</b> เข้าร่วมมื้อนี้แล้ว 🎉`, onDone: () => { showing = false; showNextJoiner(); } });
  }
  async function pollJoins() {
    if (document.hidden) return;
    const since = sessionStorage.getItem(HOST_KEY);
    let seen = [];
    try { seen = JSON.parse(sessionStorage.getItem(SEEN_KEY)) || []; } catch {}
    try {
      const fresh = (await KRD.api.getMealJoins(me.id, since)).filter((p) => p && !seen.includes(p.id) && p.id !== me.id);
      if (!fresh.length) return;
      sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((p) => p.id)]));
      selectedGroup = null;
      addToParty(fresh);
      fresh.forEach((p) => { if (!friends.some((f) => f.id === p.id)) friends.push(p); queue.push(p); });
      showNextJoiner();
    } catch {}
  }
  function startHosting() {
    if (!sessionStorage.getItem(HOST_KEY)) sessionStorage.setItem(HOST_KEY, new Date(Date.now() - 2000).toISOString());
    if (!hostTimer) hostTimer = setInterval(pollJoins, 3000);
  }
  if (me) {
    document.addEventListener('krd:host-qr', startHosting);
    if (sessionStorage.getItem(HOST_KEY)) { startHosting(); pollJoins(); }
  }

  /* ---------- สุ่ม! ---------- */
  document.getElementById('roll').addEventListener('click', roll);
  KRD.fabDice({ onClick: roll, watch: document.getElementById('roll') });
  let rolling = false;
  async function roll() {
    if (rolling) return;
    if (!me) { toast('เข้าสู่ระบบก่อนนะ แล้วค่อยสุ่มกัน'); setTimeout(() => (location.href = 'login.html'), 900); return; }
    const party = [me, ...S.party];
    const conds = S.conds;
    const note = S.note.trim();
    const result = KRD.match.recommend(party, conds, { note, location: userLoc });
    if (!result) { toast('ไม่พบร้านเลย ลองเปลี่ยนเงื่อนไขดูนะ', 'error'); return; }
    rolling = true;
    sessionStorage.setItem('krd_roll', JSON.stringify({
      party: S.party, conds, note, location: userLoc, exclude: [],
      current: { id: result.pick.id, percent: result.percent, reasons: result.reasons, relaxed: result.relaxed },
      groupName: selectedGroup ? selectedGroup.name : '',
    }));
    try { await KRD.api.addHistory(result.pick.id, party.map((p) => ({ id: p.id, name: p.display_name }))); } catch {}
    await KRD.diceRoll();
    location.href = 'result.html';
  }
})();
