/* =========================================================
   หน้าโปรไฟล์
   - สิ่งที่ฉันชอบ: กดเลือกได้หลายตัว บันทึกอัตโนมัติ
   - แก้ไขโปรไฟล์ (popup): รูป, ชื่อ (เปลี่ยนได้ทุก 7 วัน), MBTI + แบบทดสอบ, คำอธิบาย 80 ตัว
   - การตั้งค่า: เปลี่ยนรหัสผ่าน / การแจ้งเตือน / ออกจากระบบ
   ========================================================= */
(async function () {
  const { icon, esc, avatarHTML, mbtiBadge, openModal, confirmModal, toast, qs } = KRD;
  let me = await KRD.boot('profile');
  if (!me) { location.replace('login.html?next=profile.html'); return; }
  const page = document.getElementById('page');

  const ROWS = [
    { key: 'food', label: 'ประเภทอาหาร', icon: 'utensils', color: 'c-blue' },
    { key: 'with', label: 'ทานร่วมกับ', icon: 'users', color: 'c-pink' },
    { key: 'budget', label: 'งบประมาณ', icon: 'wallet', color: '' },
    { key: 'vibe', label: 'บรรยากาศ', icon: 'mountain', color: 'c-yellow' },
  ];

  function render() {
    page.innerHTML = `
      <div class="container profile-wrap">
        <section class="profile-card">
          <div class="avatar-wrap">${avatarHTML(me, 'lg')}</div>
          <div>
            <h1>${esc(me.display_name)}</h1>
            <div class="who-line"><span class="email">${esc(me.email)}</span>${mbtiBadge(me.mbti)}</div>
            <p class="bio">${esc(me.bio) || '<span style="color:var(--muted)">ยังไม่มีคำอธิบาย</span>'}</p>
            <div class="who-line">
              <button class="btn btn-yellow dark-text btn-sm" data-edit>${icon('pencil')} แก้ไขโปรไฟล์</button>
              <button class="btn btn-primary btn-sm" id="my-qr">${icon('qr')} QR ของฉัน</button>
              ${!me.mbti ? `<button class="btn btn-sm" id="quiz-cta">ยังไม่รู้ MBTI? ลองทำแบบทดสอบ</button>` : ''}
            </div>
          </div>
        </section>

        <section class="frame blue"><div class="frame-inner">
          <div class="likes-head">${icon('heart')}<div><h2>สิ่งที่ฉันชอบ</h2><p>ตัวเลือกการกินและบรรยากาศที่เลิฟที่สุด</p></div></div>
          ${ROWS.map((row) => `
            <div class="like-row">
              ${icon(row.icon)}
              <span class="label">${row.label}</span>
              <div class="chips">${window.PREF_OPTIONS[row.key].map(([v, l]) =>
                `<button class="chip ${row.color} ${(me.prefs[row.key] || []).map(String).includes(String(v)) ? 'on' : ''}" data-pref="${row.key}" data-v="${v}">${l}</button>`).join('')}</div>
            </div>`).join('')}
          <p class="save-note" id="save-note"></p>
        </div></section>

        <div class="settings-row">
          <section class="frame sand"><div class="frame-inner">
            <div class="settings-head">${icon('gear')}<h2>การตั้งค่าบัญชี</h2></div>
            <button class="setting-item" id="s-pw">${icon('key')}<span>เปลี่ยนรหัสผ่าน</span>${icon('chevronRight', 'go')}</button>
            <button class="setting-item" id="s-notif">${icon('bell')}<span>การแจ้งเตือน</span>${icon('chevronRight', 'go')}</button>
            <button class="setting-item" id="s-out">${icon('logout')}<span>ออกจากระบบ</span>${icon('chevronRight', 'go')}</button>
          </div></section>
          <div class="side-photo">${KRD.assetImg('profile/side.jpg', { emoji: '🍜', alt: 'น้องเกี๊ยวกับชามบะหมี่' })}</div>
        </div>
      </div>`;

    page.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', openEdit));
    document.getElementById('my-qr').onclick = () => KRD.people.myQrPopup(me, { mode: 'friend' });
    const qc = document.getElementById('quiz-cta'); if (qc) qc.onclick = () => openQuiz(async (t) => { me = await KRD.api.updateMe({ mbti: t }); render(); toast(`บันทึก MBTI = ${t} แล้ว`); });
    page.querySelectorAll('[data-pref]').forEach((b) => b.addEventListener('click', () => togglePref(b)));
    document.getElementById('s-pw').onclick = openPassword;
    document.getElementById('s-notif').onclick = openNotif;
    document.getElementById('s-out').onclick = logout;
  }

  /* ---------- สิ่งที่ฉันชอบ (autosave) ---------- */
  let saveTimer;
  function togglePref(b) {
    const k = b.dataset.pref;
    const v = k === 'budget' ? Number(b.dataset.v) : b.dataset.v;
    const cur = new Set(me.prefs[k] || []);
    cur.has(v) ? cur.delete(v) : cur.add(v);
    me.prefs[k] = [...cur];
    b.classList.toggle('on');
    const note = document.getElementById('save-note');
    note.textContent = 'กำลังบันทึก...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try { me = await KRD.api.updateMe({ prefs: me.prefs }); note.textContent = 'บันทึกแล้ว ✓'; }
      catch (e) { note.textContent = ''; toast(e.message, 'error'); }
    }, 500);
  }

  /* ---------- แก้ไขโปรไฟล์ ---------- */
  function openEdit() {
    const DAYS7 = 7 * 24 * 3600 * 1000;
    const lastChange = me.name_changed_at ? new Date(me.name_changed_at).getTime() : 0;
    const canRename = Date.now() - lastChange >= DAYS7;
    const daysLeft = Math.ceil((lastChange + DAYS7 - Date.now()) / (24 * 3600 * 1000));
    const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    let newAvatar = null;

    openModal({
      title: 'แก้ไขโปรไฟล์', iconName: 'pencil',
      body: `
        <form id="ef" novalidate>
          <div class="edit-avatar">
            <span class="field" style="margin:0"><label>${icon('image')} รูปโปรไฟล์</label></span>
            <div class="avatar-wrap"><span id="av-prev">${avatarHTML(me, 'lg')}</span>
              <label class="cam" title="เปลี่ยนรูป" aria-label="เปลี่ยนรูปโปรไฟล์">${icon('imageAdd')}<input type="file" accept="image/*" id="av-file" hidden></label></div>
          </div>
          <hr class="form-sep">
          <div class="field"><label>ชื่อผู้ใช้</label>
            <input class="input" name="name" maxlength="40" value="${esc(me.display_name)}" ${canRename ? '' : 'disabled'}>
            <span class="hint">${canRename ? 'เปลี่ยนชื่อแล้วจะเปลี่ยนได้อีกครั้งในอีก 7 วัน' : `สามารถเปลี่ยนชื่อได้อีกครั้ง ในอีก ${daysLeft} วัน`}</span></div>
          <div class="field"><label>อีเมล</label>
            <div class="readonly-row"><input class="input" value="${esc(me.email)}" disabled></div>
            </div>
          <hr class="form-sep">
          <div class="field"><label>MBTI ของฉัน</label>
            <div class="mbti-row">
              <select class="input" name="mbti"><option value="">— ยังไม่ระบุ —</option>${types.map((t) => `<option ${me.mbti === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
              <button type="button" class="link-btn" id="quiz">ไม่รู้ MBTI? ทำแบบทดสอบสั้นๆ</button>
            </div>
            </div>
          <hr class="form-sep">
          <div class="field"><label>คำอธิบาย</label>
            <textarea class="input" name="bio" maxlength="80" rows="3">${esc(me.bio)}</textarea>
            <span class="counter" id="cnt">${me.bio.length}/80</span></div>
          <p class="error-text" id="e-err"></p>
          <div class="modal-actions">
            <button type="button" class="btn" data-cancel>ยกเลิก</button>
            <button type="submit" class="btn btn-primary">บันทึก</button>
          </div>
        </form>`,
      onMount(el, close) {
        const f = el.querySelector('#ef');
        el.querySelector('[data-cancel]').onclick = close;
        f.bio.addEventListener('input', () => (el.querySelector('#cnt').textContent = `${f.bio.value.length}/80`));
        el.querySelector('#quiz').onclick = () => openQuiz((t) => { f.mbti.value = t; });
        el.querySelector('#av-file').addEventListener('change', async (e) => {
          const file = e.target.files[0]; if (!file) return;
          e.target.value = '';
          // ครอปเป็นวงกลมก่อนอัปโหลด (ไฟล์จริงเป็นสี่เหลี่ยมจัตุรัส แสดงผลเป็นวงกลม)
          const blob = await KRD.cropImage(file, { aspect: 1, round: true, outW: KRD.api.mode === 'demo' ? 300 : 600, title: 'ปรับรูปโปรไฟล์' });
          if (!blob) return;
          newAvatar = blob;
          el.querySelector('#av-prev').innerHTML = `<span class="avatar lg"><img src="${URL.createObjectURL(newAvatar)}" alt=""></span>`;
        });
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const err = el.querySelector('#e-err'); err.textContent = '';
          const name = f.name.value.trim();
          if (!name) { err.textContent = 'กรุณาใส่ชื่อผู้ใช้'; return; }
          const patch = { mbti: f.mbti.value, bio: f.bio.value.slice(0, 80) };
          if (canRename && name !== me.display_name) { patch.display_name = name; patch.name_changed_at = new Date().toISOString(); }
          const btn = f.querySelector('[type=submit]'); btn.disabled = true;
          try {
            if (newAvatar) patch.avatar_url = await KRD.api.uploadImage(newAvatar, 'avatars');
            me = await KRD.api.updateMe(patch);
            close(); render(); KRD.renderHeader('profile', { me });
            toast('บันทึกโปรไฟล์แล้ว ✓');
          } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
        });
      },
    });
  }

  /* ---------- แบบทดสอบ MBTI แบบสั้น (8 ข้อ / มิติละ 2 ข้อ) ---------- */
  const QUIZ = [
    { q: 'วันหยุดยาว แบบไหนชาร์จพลังได้ดีกว่า?', a: ['นัดเพื่อนไปกินไปเที่ยวหลายๆ ที่', 'E'], b: ['อยู่บ้าน ดูซีรีส์ กินขนมเงียบๆ', 'I'] },
    { q: 'ไปร้านอาหารกับแก๊งใหญ่ คุณมักจะ...', a: ['ชวนคุยไม่หยุด เปิดประเด็นเก่ง', 'E'], b: ['ฟังเพื่อนคุยเป็นหลัก คุยลึกกับคนข้างๆ', 'I'] },
    { q: 'เลือกเมนูในร้านใหม่ คุณจะ...', a: ['สั่งเมนูที่คุ้นเคย ชัวร์ว่าอร่อย', 'S'], b: ['ลองเมนูแปลกๆ ที่ไม่เคยกิน', 'N'] },
    { q: 'เวลาเพื่อนเล่าถึงร้านใหม่ คุณสนใจ...', a: ['ราคา ที่ตั้ง เมนูมีอะไรบ้าง', 'S'], b: ['คอนเซปต์ร้าน เรื่องราว ความรู้สึก', 'N'] },
    { q: 'เพื่อนเลือกร้านที่คุณไม่ชอบ คุณจะ...', a: ['บอกตรงๆ พร้อมเหตุผลว่าทำไมไม่เวิร์ก', 'T'], b: ['ยอมไปก่อน ไม่อยากให้เพื่อนเสียความรู้สึก', 'F'] },
    { q: 'ร้านในฝันของคุณคือ...', a: ['คุ้มค่า อิ่ม ได้ของไว', 'T'], b: ['บรรยากาศดี อบอุ่น ถ่ายรูปสวย', 'F'] },
    { q: 'นัดกินข้าวกับเพื่อน คุณชอบแบบไหน?', a: ['วางแผนล่วงหน้า จองโต๊ะไว้เลย', 'J'], b: ['เดี๋ยวค่อยว่ากันหน้างาน', 'P'] },
    { q: 'ถ้าร้านที่ตั้งใจไปปิดกะทันหัน...', a: ['หงุดหงิดนิดๆ รีบหาแผนสำรอง', 'J'], b: ['ไม่เป็นไร เดินหาร้านใหม่ก็สนุกดี', 'P'] },
  ];
  const DESC = { E: 'ชอบพบปะผู้คน', I: 'ชอบความสงบ', S: 'ชอบความชัดเจน', N: 'ชอบไอเดียใหม่', T: 'ใช้เหตุผล', F: 'ใช้ความรู้สึก', J: 'ชอบวางแผน', P: 'ยืดหยุ่น' };

  function openQuiz(onDone) {
    const ans = [];
    openModal({
      title: 'แบบทดสอบ MBTI ฉบับสายกิน', iconName: 'target',
      body: '<div id="qz"></div>',
      onMount(el, close) {
        const box = el.querySelector('#qz');
        const step = () => {
          const i = ans.length;
          if (i === QUIZ.length) {
            const c = {}; ans.forEach((x) => (c[x] = (c[x] || 0) + 1));
            const pick = (a, b, tie) => (c[a] || 0) > (c[b] || 0) ? a : (c[b] || 0) > (c[a] || 0) ? b : tie;
            const t = pick('E', 'I', 'I') + pick('S', 'N', 'N') + pick('T', 'F', 'F') + pick('J', 'P', 'P');
            box.innerHTML = `<div class="quiz-result"><p>คุณน่าจะเป็น</p><div class="type">${t}</div>
              <p>${[...t].map((ch) => DESC[ch]).join(' · ')}</p>
              <p class="hint">* เป็นแบบทดสอบสั้นเพื่อความสนุก ถ้ารู้ผลจากแบบทดสอบเต็มแล้ว เลือกเองได้เลย</p>
              <div class="modal-actions" style="justify-content:center"><button class="btn" data-retry>ทำใหม่</button><button class="btn btn-primary" data-use>ใช้ผลนี้</button></div></div>`;
            box.querySelector('[data-retry]').onclick = () => { ans.length = 0; step(); };
            box.querySelector('[data-use]').onclick = () => { close(); onDone(t); };
            return;
          }
          const q = QUIZ[i];
          box.innerHTML = `<div class="quiz-progress"><div style="width:${(i / QUIZ.length) * 100}%"></div></div>
            <p class="hint" style="text-align:center">ข้อ ${i + 1} / ${QUIZ.length}</p>
            <p class="quiz-q">${q.q}</p>
            <div class="quiz-opts"><button data-a="${q.a[1]}">${q.a[0]}</button><button data-a="${q.b[1]}">${q.b[0]}</button></div>`;
          box.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => { ans.push(b.dataset.a); step(); }));
        };
        step();
      },
    });
  }

  /* ---------- เปลี่ยนรหัสผ่าน (ต้องกรอกรหัสเดิม) ---------- */
  function openPassword() {
    openModal({
      title: 'การตั้งค่าบัญชี', iconName: 'gear',
      body: `<form id="pf" novalidate>
          <div class="field"><label>${icon('key')} เปลี่ยนรหัสผ่าน</label></div>
          ${KRD.pwField('old', 'รหัสผ่านเดิม', 'current-password')}
          ${KRD.pwField('pw', 'รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)', 'new-password')}
          ${KRD.pwField('cf', 'ยืนยันรหัสผ่านใหม่', 'new-password')}
          <p class="error-text" id="p-err"></p>
          <div class="modal-actions"><button type="button" class="btn" data-cancel>ยกเลิก</button><button class="btn btn-primary" type="submit">บันทึก</button></div>
        </form>`,
      onMount(el, close) {
        const f = el.querySelector('#pf'), err = el.querySelector('#p-err');
        KRD.bindPwToggles(el);
        el.querySelector('[data-cancel]').onclick = close;
        f.addEventListener('submit', async (e) => {
          e.preventDefault(); err.textContent = '';
          if (!f.old.value) { err.textContent = 'กรุณากรอกรหัสผ่านเดิม'; return; }
          if (f.pw.value.length < 6) { err.textContent = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'; return; }
          if (f.pw.value !== f.cf.value) { err.textContent = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน'; return; }
          if (f.pw.value === f.old.value) { err.textContent = 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม'; return; }
          const btn = f.querySelector('[type=submit]'); btn.disabled = true;
          try { await KRD.api.changePassword(f.old.value, f.pw.value); close(); toast('เปลี่ยนรหัสผ่านแล้ว ✓'); }
          catch (ex) { err.textContent = ex.message; btn.disabled = false; }
        });
      },
    });
  }

  /* ---------- การแจ้งเตือน (บันทึกค่าเปิด/ปิด) ---------- */
  function openNotif() {
    const isMobile = matchMedia('(max-width: 767px)').matches;
    const items = [['push', isMobile ? 'แจ้งเตือนบนมือถือ' : 'แจ้งเตือนบนเดสก์ท็อป'], ['email', 'แจ้งเตือนผ่านอีเมล'], ['news', 'ข่าวสารและอัปเดตใหม่ๆ']];
    openModal({
      title: 'การตั้งค่าบัญชี', iconName: 'gear',
      body: `<div class="field"><label>${icon('bell')} การแจ้งเตือน</label></div>
        ${items.map(([k, l]) => `<div class="toggle-row"><span>${l}</span><label class="switch"><input type="checkbox" data-n="${k}" ${me.notif[k] ? 'checked' : ''}><span></span></label></div>`).join('')}
        <div class="modal-actions"><button class="btn" data-cancel>ยกเลิก</button><button class="btn btn-primary" data-save>บันทึก</button></div>`,
      onMount(el, close) {
        el.querySelector('[data-cancel]').onclick = close;
        el.querySelector('[data-save]').onclick = async () => {
          const notif = {}; el.querySelectorAll('[data-n]').forEach((c) => (notif[c.dataset.n] = c.checked));
          try { me = await KRD.api.updateMe({ notif }); close(); toast('บันทึกการแจ้งเตือนแล้ว ✓'); } catch (e) { toast(e.message, 'error'); }
        };
      },
    });
  }

  async function logout() {
    const ok = await confirmModal({ title: 'การตั้งค่าบัญชี', message: 'ต้องการออกจากระบบ ใช่หรือไม่ ?', okText: 'ออกจากระบบ', iconName: 'gear' });
    if (!ok) return;
    await KRD.api.signOut();
    sessionStorage.clear();
    location.href = 'login.html';
  }

  render();
  if (qs('welcome')) {
    toast('ยินดีต้อนรับ! ตั้งค่า MBTI และสิ่งที่ชอบก่อนสุ่มครั้งแรกนะ');
    setTimeout(openEdit, 600);
  }
})();
