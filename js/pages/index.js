/* =========================================================
   หน้าหลัก: สุ่มร้าน / มื้อนี้ไปกับใคร / เงื่อนไข / ร้านแนะนำ
   ========================================================= */
(async function () {
  const { icon, esc, diceSVG, avatarHTML, mbtiBadge, restaurantCard, bindFavButtons, openModal, toast } = KRD;
  const me = await KRD.boot('home');

  /* ---------- state (เก็บใน sessionStorage ให้กลับมาหน้านี้แล้วยังอยู่) ---------- */
  const S = {
    get party() { try { return JSON.parse(sessionStorage.getItem('krd_party')) || []; } catch { return []; } },
    set party(v) { sessionStorage.setItem('krd_party', JSON.stringify(v)); },
    get conds() { try { return JSON.parse(sessionStorage.getItem('krd_conds')) || []; } catch { return []; } },
    set conds(v) { sessionStorage.setItem('krd_conds', JSON.stringify(v)); },
    get search() { return sessionStorage.getItem('krd_search') || ''; },
    set search(v) { sessionStorage.setItem('krd_search', v); },
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
  const foods = [
    { t: '0%', l: '51%', s: 70, e: '🍤' }, { t: '18%', l: '58%', s: 56, e: '🥬' }, { t: '-2%', l: '76%', s: 74, e: '🍲' },
    { t: '0%', l: '93%', s: 70, e: '🍗' }, { t: '28%', l: '84%', s: 96, e: '🍝' }, { t: '45%', l: '96%', s: 70, e: '🍚' },
    { t: '58%', l: '86%', s: 118, e: '🍛' }, { t: '86%', l: '62%', s: 60, e: '🥟' }, { t: '86%', l: '76%', s: 74, e: '🥗' }, { t: '92%', l: '53%', s: 56, e: '🍜' },
  ];
  document.getElementById('page').innerHTML = `
    <section class="hero">
      ${foods.map((f, i) => `<span class="food-deco" style="top:${f.t};left:${f.l};width:${f.s}px;height:${f.s}px;font-size:${f.s / 3.2}px">
          ${KRD.assetImg(`hero/food${(i % 7) + 1}.png`, { emoji: f.e, lazy: false })}</span>`).join('')}
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
          <form class="search-box" id="search-form">
            <input id="search" type="search" placeholder="ค้นหารายละเอียดเพิ่มเติม... เช่น ราเมง, ยำ" value="${esc(S.search)}">
            ${icon('search')}
          </form>
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
  condWrap.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cond]'); if (!b) return;
    const k = b.dataset.cond;
    const set = new Set(S.conds);
    set.has(k) ? set.delete(k) : set.add(k);
    S.conds = [...set];
    if (k === 'near' && set.has(k)) getLocation();
    paintConds(); renderNearby();
  });
  const searchInp = document.getElementById('search');
  searchInp.addEventListener('input', () => { S.search = searchInp.value; renderNearby(); });
  document.getElementById('search-form').addEventListener('submit', (e) => { e.preventDefault(); roll(); });

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
    const q = (S.search || '').trim().toLowerCase();
    let list = window.RESTAURANTS.slice()
      .filter((r) => !q || [r.name, r.nameEn, r.short, ...r.cats.map((c) => window.LABELS.cats[c])].join(' ').toLowerCase().includes(q))
      .sort((a, b) => KRD.match.distanceKm(origin, a) - KRD.match.distanceKm(origin, b));
    const sc = document.getElementById('scroller');
    sc.innerHTML = list.length ? list.map((r) => restaurantCard(r, { fav: favIds.includes(r.id) })).join('')
      : '<div class="empty-state" style="grid-column:1/-1"><div class="big">🔍</div><h3>ไม่พบร้านที่ค้นหา</h3><p>ลองใช้คำอื่นดูนะ</p></div>';
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
    const emptySlots = Math.max(1, 3 - Math.max(0, party.length - 4));
    partyArea.innerHTML = `
      <div class="party">
        <span class="slot" title="${esc(me.display_name)} (คุณ)">${avatarHTML(me)}<span class="me-tag">ฉัน</span></span>
        ${party.map((p) => `<span class="slot" title="${esc(p.display_name)} ${p.mbti || ''}">${avatarHTML(p)}
            <button class="remove" data-remove="${p.id}" aria-label="เอา ${esc(p.display_name)} ออก">${icon('x')}</button></span>`).join('')}
        ${Array.from({ length: emptySlots }, () => `<button class="slot" data-invite title="ชวนเพื่อนมาจอย (ล็อกอิน/สแกน QR)">${avatarHTML(null)}</button>`).join('')}
        <button class="add-btn" id="add-friend" title="เลือกจากรายชื่อเพื่อน" aria-label="เพิ่มเพื่อน">${icon('plus')}</button>
      </div>
      <p class="party-name">${party.length ? `ไปกันทั้งหมด ${party.length + 1} คน` : 'ยังไม่ได้เลือกใคร = สุ่มสำหรับคุณคนเดียว'}</p>
      <div class="group-select">
        <button id="group-btn" type="button">
          ${selectedGroup ? groupAvatar(selectedGroup) : avatarHTML(null)}
          <span>${selectedGroup ? esc(selectedGroup.name) : 'เลือกกลุ่ม'}</span>
          <span class="caret">${icon('chevronDown')}</span>
        </button>
      </div>`;
    partyArea.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
      S.party = S.party.filter((p) => p.id !== b.dataset.remove); selectedGroup = null; renderParty();
    }));
    partyArea.querySelectorAll('[data-invite]').forEach((b) => b.addEventListener('click', openInvite));
    document.getElementById('add-friend').addEventListener('click', openFriendPicker);
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

  // เลือกเพื่อนจากรายชื่อ (ADD MEMBERS)
  function openFriendPicker() {
    openModal({
      title: 'รายชื่อสมาชิก', iconName: 'user',
      body: friends.length ? `<div class="pick-list">${friends.map((f) => `
          <div class="pick-row">${avatarHTML(f)}<div class="who"><strong>${esc(f.display_name)}</strong>${mbtiBadge(f.mbti)}</div>
          <button class="add ${S.party.some((p) => p.id === f.id) ? 'on' : ''}" data-pick="${f.id}">${icon(S.party.some((p) => p.id === f.id) ? 'check' : 'plusCircle')} <span>${S.party.some((p) => p.id === f.id) ? 'เพิ่มแล้ว' : 'เพิ่ม'}</span></button></div>`).join('')}</div>
          <div class="modal-actions"><button class="btn btn-primary" data-done>เสร็จสิ้น</button></div>`
        : `<div class="empty-state"><div class="big">👥</div><h3>ยังไม่มีเพื่อนเลย</h3><p>ไปเพิ่มเพื่อนที่หน้าสมาชิกก่อนนะ</p><br><a class="btn btn-primary" href="member.html">ไปหน้าสมาชิก</a></div>`,
      onMount(el, close) {
        el.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.pick;
          if (S.party.some((p) => p.id === id)) S.party = S.party.filter((p) => p.id !== id);
          else addToParty([friends.find((f) => f.id === id)]);
          const on = S.party.some((p) => p.id === id);
          b.classList.toggle('on', on);
          b.innerHTML = `${icon(on ? 'check' : 'plusCircle')} <span>${on ? 'เพิ่มแล้ว' : 'เพิ่ม'}</span>`;
          selectedGroup = null; renderParty();
        }));
        const d = el.querySelector('[data-done]'); if (d) d.onclick = close;
      },
    });
  }

  // Popup "มาจอยกัน !" : เพื่อนล็อกอินบนเครื่องเรา หรือ สแกน QR จากมือถือตัวเอง
  function openInvite() {
    const since = new Date(Date.now() - 1000).toISOString();
    let timer = null;
    const joinUrl = new URL('join.html?host=' + encodeURIComponent(me.id), location.href).href;
    openModal({
      theme: 'brown', noHead: true, wide: true,
      body: `
        <div class="invite">
          <form id="guest-form" novalidate>
            <h4>มาจอยกัน !</h4>
            <input class="input" type="email" name="email" placeholder="อีเมล" autocomplete="off">
            <input class="input" type="password" name="password" placeholder="รหัสผ่าน" autocomplete="new-password">
            <p class="error-text" id="g-err"></p>
            <button class="btn btn-yellow btn-block" type="submit">เข้าสู่ระบบ</button>
            <p class="qr-caption">เพื่อนล็อกอินบนเครื่องนี้ได้เลย<br>(ระบบจะไม่ทำให้บัญชีของคุณหลุด)</p>
          </form>
          <div>
            <div class="qr-box"><div class="qr" id="qr"></div></div>
            <p class="qr-caption">หรือให้เพื่อนสแกนด้วยมือถือตัวเอง<br>แล้วกด "เข้าร่วมมื้อนี้"</p>
            <div class="joined-list" id="joined"></div>
          </div>
        </div>`,
      onMount(el) {
        try { new QRCode(el.querySelector('#qr'), { text: joinUrl, width: 180, height: 180, colorDark: '#7F4D2F', colorLight: '#ffffff' }); }
        catch { el.querySelector('#qr').innerHTML = `<a href="${joinUrl}" style="color:#7F4D2F;font-size:12px;word-break:break-all">${esc(joinUrl)}</a>`; }
        const f = el.querySelector('#guest-form'), err = el.querySelector('#g-err');
        const joined = el.querySelector('#joined');
        const showJoined = (p) => { joined.insertAdjacentHTML('beforeend', `<span class="pill">✓ ${esc(p.display_name)}</span>`); };
        f.addEventListener('submit', async (e) => {
          e.preventDefault(); err.textContent = '';
          const btn = f.querySelector('button'); btn.disabled = true;
          try {
            const p = await KRD.api.verifyCredentials(f.email.value, f.password.value);
            if (p.id === me.id) throw new Error('นี่คือบัญชีของคุณเองนะ 😆');
            addToParty([p]); showJoined(p);
            f.reset(); toast(`${p.display_name} เข้าร่วมมื้อนี้แล้ว 🎉`);
          } catch (ex) { err.textContent = ex.message; }
          btn.disabled = false;
        });
        // รอเพื่อนสแกน QR — เช็กทุก 3 วินาทีระหว่างที่ popup เปิดอยู่
        const seen = new Set();
        timer = setInterval(async () => {
          try {
            const list = await KRD.api.getMealJoins(me.id, since);
            list.filter((p) => !seen.has(p.id)).forEach((p) => {
              seen.add(p.id); addToParty([p]); showJoined(p);
              toast(`${p.display_name} สแกนเข้าร่วมแล้ว 🎉`);
              if (!friends.some((f) => f.id === p.id)) friends.push(p);
            });
          } catch {}
        }, 3000);
      },
      onClose() { clearInterval(timer); },
    });
  }

  /* ---------- สุ่ม! ---------- */
  document.getElementById('roll').addEventListener('click', roll);
  async function roll() {
    if (!me) { toast('เข้าสู่ระบบก่อนนะ แล้วค่อยสุ่มกัน'); setTimeout(() => (location.href = 'login.html'), 900); return; }
    const party = [me, ...S.party];
    const conds = S.conds;
    const result = KRD.match.recommend(party, conds, { search: S.search.trim(), location: userLoc });
    if (!result) { toast('ไม่พบร้านที่ตรงกับคำค้นหาเลย ลองเปลี่ยนคำดูนะ', 'error'); return; }
    sessionStorage.setItem('krd_roll', JSON.stringify({
      party: S.party, conds, search: S.search.trim(), location: userLoc, exclude: [],
      current: { id: result.pick.id, percent: result.percent, reasons: result.reasons, relaxed: result.relaxed },
      groupName: selectedGroup ? selectedGroup.name : '',
    }));
    try { await KRD.api.addHistory(result.pick.id, party.map((p) => ({ id: p.id, name: p.display_name }))); } catch {}
    await KRD.diceRoll();
    location.href = 'result.html';
  }
})();
