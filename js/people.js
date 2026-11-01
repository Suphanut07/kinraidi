/* =========================================================
   Popup ที่ใช้ร่วมกันหลายหน้า
   - personPopup  : ดูรายละเอียดโปรไฟล์ของคนอื่น (หน้าสุ่มเลย / สมาชิก / ผลลัพธ์)
   - joinPopup    : "มาจอยกัน !" — สแกน QR (มือถือ/แท็บเล็ต) · QR ของฉัน · รหัสเพื่อน
   - myQrPopup    : QR ของฉัน + รหัสเพื่อน
   - scanPopup    : "สแกน QR" จากเมนู ☰ (ทุกหน้า)
   - successPopup : popup แจ้งผล (สแกนคนต่อไป / เสร็จสิ้น)
   กติกา QR:  QR หัวทีม (?host=) → คนสแกนเข้าร่วมมื้อของหัวทีม · QR โปรไฟล์ (?friend=) → เป็นเพื่อนอย่างเดียว
              หัวทีมกรอกรหัสเพื่อนในหน้าสุ่มเลย → คนนั้นเข้ามื้อของหัวทีม
   ========================================================= */
(function () {
  const { icon, esc, avatarHTML, mbtiBadge, openModal, toast } = KRD;

  // มือถือ/แท็บเล็ต = จอสัมผัสที่ไม่มีเมาส์ (ไม่ดูความกว้างจอ เพราะ iPad แนวนอนกว้างพอๆ กับคอม)
  const isTouchDevice = () => matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches);

  /* ---------- รายละเอียดโปรไฟล์ ---------- */
  function prefsHTML(p) {
    const rows = [['food', 'ประเภทอาหาร', 'utensils'], ['with', 'ทานร่วมกับ', 'users'], ['budget', 'งบประมาณ', 'wallet'], ['vibe', 'บรรยากาศ', 'mountain']];
    const html = rows.map(([k, label, ic]) => {
      const vals = (p.prefs[k] || []).map((v) => (window.PREF_OPTIONS[k].find((o) => String(o[0]) === String(v)) || [])[1]).filter(Boolean);
      return vals.length ? `<div class="pp-row">${icon(ic)}<span class="pp-label">${label}</span><span class="pp-chips">${vals.map((v) => `<span class="chip static">${esc(v)}</span>`).join('')}</span></div>` : '';
    }).join('');
    return html || '<p class="hint" style="text-align:center">ยังไม่ได้ตั้ง "สิ่งที่ฉันชอบ"</p>';
  }

  function personPopup(p, { actions = [] } = {}) {
    openModal({
      title: 'โปรไฟล์', iconName: 'user',
      body: `
        <div class="person-pop">
          ${avatarHTML(p, 'lg')}
          <h3>${esc(p.display_name)}</h3>
          <p>${mbtiBadge(p.mbti)}</p>
          ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ''}
        </div>
        <hr class="form-sep">
        <p class="pp-title">${icon('heart')} สิ่งที่ชอบ</p>
        ${prefsHTML(p)}
        ${actions.length ? `<div class="modal-actions" style="justify-content:center">${actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-act="${i}">${a.icon ? icon(a.icon) : ''} ${esc(a.label)}</button>`).join('')}</div>` : ''}`,
      onMount(el, close) {
        el.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => actions[b.dataset.act].onClick(close)));
      },
    });
  }

  /* ---------- โหลดไลบรารี QR เมื่อจำเป็น (ทุกหน้าสแกนได้จากเมนู ☰) ---------- */
  const LIBS = {
    qr: ['QRCode', 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'],
    scan: ['Html5Qrcode', 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'],
  };
  const loading = {};
  function loadLib(k) {
    const [glob, src] = LIBS[k];
    if (window[glob]) return Promise.resolve(true);
    return (loading[k] = loading[k] || new Promise((res) => {
      const sc = document.createElement('script');
      sc.src = src; sc.onload = () => res(!!window[glob]); sc.onerror = () => { delete loading[k]; res(false); };
      document.head.appendChild(sc);
    }));
  }

  /* ---------- popup แจ้งผลสำเร็จ (หน้าตาแบบ popup โปรไฟล์) ---------- */
  function successPopup(p, { title = 'ยินดีด้วย !', text = '', nextLabel = 'สแกนคนต่อไป', onNext, onDone } = {}) {
    let chosen = false;
    openModal({
      title, iconName: 'users',
      body: `
        <div class="person-pop success-pop">
          ${avatarHTML(p, 'lg')}
          <h3>${esc(p.display_name)}</h3>
          <p>${mbtiBadge(p.mbti)}</p>
          <p class="success-text">${text}</p>
        </div>
        <div class="modal-actions" style="justify-content:center">
          ${onNext ? `<button class="btn" data-next>${esc(nextLabel)}</button>` : ''}
          <button class="btn btn-primary" data-done>เสร็จสิ้น</button>
        </div>`,
      onMount(el, close) {
        const n = el.querySelector('[data-next]');
        if (n) n.onclick = () => { chosen = true; close(); onNext(); };
        el.querySelector('[data-done]').onclick = () => { chosen = true; close(); onDone && onDone(); };
      },
      onClose() { if (!chosen) (onNext || onDone || (() => {}))(); },
    });
  }

  /* ---------- อ่านลิงก์จาก QR → ทำตามชนิด ----------
     join.html?host=<id>   = QR หัวทีม (หน้าสุ่มเลย) → คนสแกน "เข้าร่วมมื้อ" ของหัวทีม (+ เป็นเพื่อนกัน) — ตี้ของคนสแกนเองไม่เปลี่ยน
     join.html?friend=<id> = QR โปรไฟล์ → เป็นเพื่อนกันอย่างเดียว */
  async function handleScan(text, me) {
    let host = null, friend = null;
    try { const u = new URL(text); host = u.searchParams.get('host'); friend = u.searchParams.get('friend'); } catch {}
    const id = host || friend;
    if (!id) return { error: 'QR นี้ไม่ใช่ของกินรัยดี ลองใหม่อีกครั้ง' };
    if (id === me.id) return { error: 'นี่คือ QR ของคุณเองนะ 😆' };
    const p = (await KRD.api.getProfiles([id]).catch(() => []))[0];
    if (!p) return { error: 'ไม่พบผู้ใช้นี้' };
    try {
      await KRD.api.addFriend(p.id);
      if (host) await KRD.api.joinMeal(p.id);
    } catch (e) { return { error: e.message }; }
    return host
      ? { p, title: 'เข้าร่วมแล้ว !', text: `คุณเข้าร่วมมื้อของ <b>${esc(p.display_name)}</b> แล้ว<br>รอหัวทีมกดสุ่มได้เลย 🎲` }
      : { p, title: 'ยินดีด้วย !', text: `คุณเพิ่มเพื่อนกับ <b>${esc(p.display_name)}</b> แล้ว 🎉` };
  }

  /* กล้องสแกน QR — ใช้ทั้งใน popup "สแกน QR" (เมนู ☰) และ "มาจอยกัน !" บนมือถือ
     สแกนเจอ → หยุดกล้องชั่วคราว → popup ผลลัพธ์ (สแกนคนต่อไป / เสร็จสิ้น) */
  function makeScanner(box, hint, me, { onDone } = {}) {
    let scanner = null, busy = false, alive = true;
    async function start() {
      if (!(await loadLib('scan'))) { hint.textContent = 'โหลดตัวสแกนไม่สำเร็จ ใช้รหัสเพื่อนแทนได้'; return; }
      if (!alive) return;
      try {
        scanner = new Html5Qrcode(box.id);
        await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 200, height: 200 } }, async (text) => {
          if (busy) return; busy = true;
          try { scanner.pause(true); } catch {}
          const r = await handleScan(text, me);
          if (r.error) {
            hint.textContent = r.error;
            setTimeout(() => { busy = false; try { scanner.resume(); } catch {} }, 1500);
            return;
          }
          toast(r.p.display_name + (r.title === 'เข้าร่วมแล้ว !' ? ' — เข้าร่วมมื้อแล้ว' : ' — เป็นเพื่อนกันแล้ว'));
          successPopup(r.p, {
            title: r.title, text: r.text,
            onNext: () => { hint.textContent = 'เล็ง QR คนต่อไปได้เลย'; busy = false; try { scanner.resume(); } catch {} },
            onDone: () => { onDone && onDone(); },
          });
        });
        hint.textContent = 'เล็ง QR ของเพื่อนให้อยู่ในกรอบ';
      } catch {
        hint.textContent = 'เปิดกล้องไม่ได้ (ต้องกดอนุญาตกล้อง และเปิดเว็บผ่าน https) — ใช้รหัสเพื่อนแทนได้';
      }
    }
    function stop() { alive = false; if (scanner) { try { scanner.stop().catch(() => {}); } catch {} scanner = null; } }
    start();
    return { stop };
  }

  /* ---------- สแกน QR (จากเมนู ☰ ทุกหน้า) ---------- */
  function scanPopup(me) {
    let sc = null;
    openModal({
      title: 'สแกน QR', iconName: 'scan',
      body: `<div class="join-pop">
          <div class="scan-box"><div id="qr-reader-g"></div><p class="qr-caption" id="scan-hint-g">กำลังเปิดกล้อง…</p></div>
          <p class="qr-caption">สแกน QR ของหัวทีม = เข้าร่วมมื้อนั้น · สแกน QR โปรไฟล์ = เพิ่มเพื่อน</p>
        </div>`,
      onMount(el, close) { sc = makeScanner(el.querySelector('#qr-reader-g'), el.querySelector('#scan-hint-g'), me, { onDone: close }); },
      onClose() { sc && sc.stop(); },
    });
  }

  /* ---------- QR ของฉัน ----------
     mode 'meal' (หน้าสุ่มเลย): ฉันเป็นหัวทีม — หน้าสุ่มเลยจะคอยรับคนที่สแกนเข้ามาตลอดที่ยังเปิดหน้านี้อยู่ */
  function myQrPopup(me, { mode = 'friend' } = {}) {
    const param = mode === 'meal' ? 'host' : 'friend';
    const url = new URL(`join.html?${param}=${encodeURIComponent(me.id)}`, location.href).href;
    if (mode === 'meal') document.dispatchEvent(new CustomEvent('krd:host-qr'));
    openModal({
      title: 'มาจอยกัน !', iconName: 'users',
      body: `<div class="qr-pop">
          <div class="qr-box"><div class="qr" id="my-qr"></div></div>
          <p class="qr-name"><b>${esc(me.display_name)}</b><br>${esc(me.email)}</p>
          <p class="qr-caption">รหัสเพื่อนของฉัน</p>
          <p class="qr-code">${esc(me.friend_code)}</p>
          <p class="qr-caption">${mode === 'meal' ? 'ให้เพื่อนสแกนด้วยมือถือ เพื่อเข้าร่วมมื้อนี้ (ระบบจะเด้งบอกเมื่อมีคนเข้ามา)' : 'ให้เพื่อนสแกน หรือกรอกรหัสนี้ เพื่อเป็นเพื่อนกัน'}</p>
          <div class="modal-actions" style="justify-content:center"><button class="btn btn-primary" data-close>ปิด</button></div>
        </div>`,
      async onMount(el, close) {
        el.querySelector('[data-close]').onclick = close;
        const box = el.querySelector('#my-qr');
        if (await loadLib('qr')) {
          try { new QRCode(box, { text: url, width: 190, height: 190, colorDark: '#7F4D2F', colorLight: '#ffffff' }); return; } catch {}
        }
        box.innerHTML = `<a href="${url}" style="color:#7F4D2F;font-size:12px;word-break:break-all">${esc(url)}</a>`;
      },
    });
  }

  /* ---------- มาจอยกัน ! ----------
     - มือถือ/แท็บเล็ต: เปิดกล้องสแกนทันที (ผลการสแกนเหมือนเมนู "สแกน QR")
     - กรอกรหัสเพื่อน: เป็นเพื่อนกัน + (mode 'meal') ดึงคนนั้นเข้ามื้อของฉัน ผ่าน onAdded */
  function joinPopup(me, { mode = 'friend', onAdded } = {}) {
    const touch = isTouchDevice();
    let sc = null;
    openModal({
      title: 'มาจอยกัน !', iconName: 'users',
      body: `<div class="join-pop">
          ${touch ? `
            <div class="scan-box"><div id="qr-reader"></div><p class="qr-caption" id="scan-hint">กำลังเปิดกล้อง… เล็ง QR ของเพื่อนได้เลย</p></div>
            <div class="join-or"><span>หรือ</span></div>` : ''}
          <button class="btn btn-yellow btn-block" id="j-myqr">${icon('qr')} QR ของฉัน</button>
          <div class="join-or"><span>หรือกรอกรหัสเพื่อน</span></div>
          <form id="j-form" class="code-form" novalidate>
            <input class="input" name="code" maxlength="6" placeholder="เช่น AB12CD" autocomplete="off" autocapitalize="characters">
            <button class="btn btn-yellow" type="submit">${icon('plus')} เพิ่ม</button>
          </form>
          <p class="error-text" id="j-msg"></p>
        </div>`,
      onMount(el, close) {
        const msg = el.querySelector('#j-msg');
        el.querySelector('#j-myqr').onclick = () => { sc && sc.stop(); close(); myQrPopup(me, { mode }); };
        const f = el.querySelector('#j-form');
        f.code.addEventListener('input', () => (f.code.value = f.code.value.toUpperCase().replace(/[^A-Z0-9]/g, '')));
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const code = f.code.value.trim();
          if (!/^[A-Z0-9]{6}$/.test(code)) { msg.textContent = 'รหัสเพื่อนมี 6 ตัวอักษร (ดูได้ที่ปุ่ม "QR ของฉัน" ในหน้าโปรไฟล์ของเพื่อน)'; return; }
          const btn = f.querySelector('button'); btn.disabled = true;
          try {
            const p = await KRD.api.findUser(code);
            if (!p) msg.textContent = 'ไม่พบผู้ใช้นี้';
            else if (p.id === me.id) msg.textContent = 'นี่คือรหัสของคุณเองนะ 😆';
            else {
              await KRD.api.addFriend(p.id);
              msg.textContent = ''; f.reset();
              onAdded && onAdded(p);
              successPopup(p, {
                title: 'ยินดีด้วย !',
                text: mode === 'meal' ? `<b>${esc(p.display_name)}</b> เข้าร่วมมื้อนี้แล้ว 🎉` : `คุณเพิ่มเพื่อนกับ <b>${esc(p.display_name)}</b> แล้ว 🎉`,
                nextLabel: 'เพิ่มคนต่อไป',
                onNext: () => setTimeout(() => f.code.focus(), 50),
                onDone: close,
              });
            }
          } catch (ex) { msg.textContent = ex.message; }
          btn.disabled = false;
        });
        if (touch) sc = makeScanner(el.querySelector('#qr-reader'), el.querySelector('#scan-hint'), me, { onDone: close });
      },
      onClose() { sc && sc.stop(); },
    });
  }

  KRD.people = { personPopup, joinPopup, myQrPopup, scanPopup, successPopup, loadLib, isTouchDevice };
})();
