/* =========================================================
   Popup ที่ใช้ร่วมกันหลายหน้า
   - personPopup  : ดูรายละเอียดโปรไฟล์ของคนอื่น (หน้าสุ่มเลย / สมาชิก / ผลลัพธ์)
   - joinPopup    : "มาจอยกัน !" — สแกน QR เพื่อน (มือถือ/แท็บเล็ต) · QR ของฉัน · รหัสเพื่อน
   - myQrPopup    : QR ของฉัน + รหัสเพื่อน
   mode: 'meal'   = ใช้ในหน้าสุ่มเลย → คนที่เพิ่ม/สแกน เข้าร่วมมื้อนี้ + เป็นเพื่อนกัน
         'friend' = ใช้ในหน้าสมาชิก/โปรไฟล์ → เป็นเพื่อนกันอย่างเดียว
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

  /* ---------- QR ของฉัน ---------- */
  function myQrPopup(me, { mode = 'friend', onJoined } = {}) {
    const param = mode === 'meal' ? 'host' : 'friend';
    const url = new URL(`join.html?${param}=${encodeURIComponent(me.id)}`, location.href).href;
    let timer = null;
    openModal({
      theme: 'brown', noHead: true,
      body: `<div class="qr-pop">
          <h4>มาจอยกัน !</h4>
          <div class="qr-box"><div class="qr" id="my-qr"></div></div>
          <p class="qr-name"><b>${esc(me.display_name)}</b><br>${esc(me.email)}</p>
          <p class="qr-caption">รหัสเพื่อนของฉัน</p>
          <p class="qr-code">${esc(me.friend_code)}</p>
          <p class="qr-caption">${mode === 'meal' ? 'ให้เพื่อนสแกนด้วยมือถือ แล้วกด "เข้าร่วมมื้อนี้"' : 'ให้เพื่อนสแกน หรือกรอกรหัสนี้ เพื่อเป็นเพื่อนกัน'}</p>
          <div class="joined-list" id="joined"></div>
          <div class="modal-actions" style="justify-content:center"><button class="btn btn-yellow" data-close>ปิด</button></div>
        </div>`,
      onMount(el, close) {
        try { new QRCode(el.querySelector('#my-qr'), { text: url, width: 190, height: 190, colorDark: '#7F4D2F', colorLight: '#ffffff' }); }
        catch { el.querySelector('#my-qr').innerHTML = `<a href="${url}" style="color:#7F4D2F;font-size:12px;word-break:break-all">${esc(url)}</a>`; }
        el.querySelector('[data-close]').onclick = close;
        if (mode === 'meal') {
          // รอเพื่อนสแกน — เช็กทุก 3 วินาทีระหว่างที่ popup เปิดอยู่
          const since = new Date(Date.now() - 1000).toISOString();
          const seen = new Set();
          timer = setInterval(async () => {
            try {
              const list = await KRD.api.getMealJoins(me.id, since);
              list.filter((p) => !seen.has(p.id)).forEach((p) => {
                seen.add(p.id);
                el.querySelector('#joined').insertAdjacentHTML('beforeend', `<span class="pill">✓ ${esc(p.display_name)}</span>`);
                toast(`${p.display_name} เข้าร่วมมื้อนี้แล้ว 🎉`);
                onJoined && onJoined(p);
              });
            } catch {}
          }, 3000);
        }
      },
      onClose() { clearInterval(timer); },
    });
  }

  /* ---------- มาจอยกัน ! ---------- */
  function joinPopup(me, { mode = 'friend', onAdded } = {}) {
    const touch = isTouchDevice();
    let scanner = null, busy = false;
    const verb = mode === 'meal' ? 'เข้าร่วมมื้อนี้' : 'เป็นเพื่อนกัน';

    async function add(p, el) {
      const msg = el.querySelector('#j-msg');
      if (!p) { msg.textContent = 'ไม่พบผู้ใช้นี้'; return false; }
      if (p.id === me.id) { msg.textContent = 'นี่คือบัญชีของคุณเองนะ 😆'; return false; }
      try {
        await KRD.api.addFriend(p.id);   // เป็นเพื่อนกันอัตโนมัติ
        el.querySelector('#j-added').insertAdjacentHTML('beforeend', `<span class="pill">✓ ${esc(p.display_name)}</span>`);
        msg.textContent = '';
        toast(`${p.display_name} ${verb}แล้ว 🎉`);
        onAdded && onAdded(p);
        return true;
      } catch (e) { msg.textContent = e.message; return false; }
    }

    openModal({
      theme: 'brown', noHead: true,
      body: `<div class="join-pop">
          <h4>มาจอยกัน !</h4>
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
          <div class="joined-list" id="j-added"></div>
        </div>`,
      onMount(el, close) {
        el.querySelector('#j-myqr').onclick = () => { stopScan(); close(); myQrPopup(me, { mode, onJoined: onAdded }); };
        const f = el.querySelector('#j-form');
        f.code.addEventListener('input', () => (f.code.value = f.code.value.toUpperCase().replace(/[^A-Z0-9]/g, '')));
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const code = f.code.value.trim();
          if (!/^[A-Z0-9]{6}$/.test(code)) { el.querySelector('#j-msg').textContent = 'รหัสเพื่อนมี 6 ตัวอักษร (ดูได้ที่ปุ่ม "QR ของฉัน" ในหน้าโปรไฟล์ของเพื่อน)'; return; }
          const btn = f.querySelector('button'); btn.disabled = true;
          try { if (await add(await KRD.api.findUser(code), el)) f.reset(); } catch (ex) { el.querySelector('#j-msg').textContent = ex.message; }
          btn.disabled = false;
        });
        if (touch) startScan(el);
      },
      onClose() { stopScan(); },
    });

    async function startScan(el) {
      const hint = el.querySelector('#scan-hint');
      if (!window.Html5Qrcode) { hint.textContent = 'โหลดตัวสแกนไม่สำเร็จ ใช้รหัสเพื่อนแทนได้'; return; }
      try {
        scanner = new Html5Qrcode('qr-reader');
        await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 200, height: 200 } }, async (text) => {
          if (busy) return; busy = true;
          let id = null;
          try { const u = new URL(text); id = u.searchParams.get('friend') || u.searchParams.get('host'); } catch {}
          if (!id) { hint.textContent = 'QR นี้ไม่ใช่ของกินรัยดี ลองใหม่อีกครั้ง'; setTimeout(() => (busy = false), 1500); return; }
          const p = (await KRD.api.getProfiles([id]).catch(() => []))[0];
          await add(p, el);
          hint.textContent = 'สแกนคนต่อไปได้เลย';
          setTimeout(() => (busy = false), 1500);   // กันสแกนซ้ำ
        });
      } catch {
        hint.textContent = 'เปิดกล้องไม่ได้ (ต้องกดอนุญาตกล้อง และเปิดเว็บผ่าน https) — ใช้รหัสเพื่อนแทนได้';
      }
    }
    function stopScan() { if (scanner) { scanner.stop().catch(() => {}); scanner = null; } }
  }

  KRD.people = { personPopup, joinPopup, myQrPopup, isTouchDevice };
})();
