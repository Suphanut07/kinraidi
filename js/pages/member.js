/* =========================================================
   หน้าสมาชิก: กลุ่มของฉัน + รายชื่อเพื่อน
   - สร้างกลุ่ม (ชื่อ, รูปจากอัปโหลด/กล้อง, เลือกสมาชิก)
   - จัดการกลุ่ม (สมาชิกทุกคนทำได้): เปลี่ยนชื่อ/รูป, เพิ่ม/เอาออก, ออกจากกลุ่ม, ลบกลุ่ม
   - เพิ่มเพื่อน: QR ของฉัน / รหัสเพื่อน / อีเมล / สแกน QR (เป็นเพื่อนกันทันที)
   ========================================================= */
(async function () {
  const { icon, esc, avatarHTML, mbtiBadge, openModal, confirmModal, toast } = KRD;
  const me = await KRD.boot('member');
  if (!me) { location.replace('login.html?next=member.html'); return; }
  const page = document.getElementById('page');
  let friends = [], groups = [];

  async function load() {
    try { [friends, groups] = await Promise.all([KRD.api.listFriends(), KRD.api.listGroups()]); }
    catch (e) { toast(e.message, 'error'); }
    render();
  }

  const groupPhoto = (g) => g.photo_url ? `<img src="${esc(g.photo_url)}" alt="">` : `<div class="ph ph-${g.name.length % 4}">👥</div>`;

  function render() {
    const SHOW = 7;
    page.innerHTML = `
      <div class="container">
        <div class="page-title"><h1>สมาชิก!</h1><p>หาเพื่อนร่วมแก๊งแล้วไปหาร้านอร่อยด้วยกัน</p></div>

        <section class="member-section">
          <div class="bar-head"><h2>${icon('users')} กลุ่มของฉัน</h2></div>
          <div class="group-grid">
            ${groups.map((g) => `
              <button class="group-card" data-group="${g.id}">
                <div class="photo">${groupPhoto(g)}</div>
                <div class="info"><h3>${esc(g.name)}</h3><span class="count">${icon('users')} ${g.members.length} members</span></div>
              </button>`).join('')}
            <button class="group-card create" id="create-group">
              <span class="plus">${icon('plus')}</span>
              <h3>สร้างกลุ่มใหม่</h3>
              <p>ชวนเพื่อนมารวมแก๊ง<br>ค้นหาร้านอร่อยไปด้วยกัน!</p>
            </button>
          </div>
        </section>

        <section class="member-section">
          <div class="bar-head">
            <h2>${icon('user')} รายชื่อสมาชิก</h2>
            <div class="bar-actions">
              <button id="my-qr">${icon('qr')} QR ของฉัน</button>
              ${friends.length > SHOW ? `<button id="see-all">ดูทั้งหมด ${icon('arrowRight')}</button>` : ''}
            </div>
          </div>
          <div class="friend-grid">
            ${friends.slice(0, SHOW).map(friendCard).join('')}
            <button class="friend-card add-card" id="add-friend"><span class="plus">${icon('plus')}</span><span class="name">เพิ่ม</span></button>
          </div>
        </section>
      </div>`;

    page.querySelectorAll('[data-group]').forEach((b) => b.addEventListener('click', () => openGroup(b.dataset.group)));
    page.querySelectorAll('[data-friend]').forEach((b) => b.addEventListener('click', () => openFriend(b.dataset.friend)));
    document.getElementById('create-group').onclick = () => openGroupForm();
    document.getElementById('add-friend').onclick = openAddFriend;
    document.getElementById('my-qr').onclick = openMyQR;
    const sa = document.getElementById('see-all'); if (sa) sa.onclick = openAllFriends;
  }
  const friendCard = (f) => `
    <button class="friend-card" data-friend="${f.id}">${avatarHTML(f)}
      <span style="min-width:0"><span class="name">${esc(f.display_name)}</span>${mbtiBadge(f.mbti)}</span></button>`;

  /* ---------- รายชื่อเพื่อนทั้งหมด ---------- */
  function openAllFriends() {
    openModal({
      title: 'รายชื่อสมาชิก', iconName: 'user', theme: 'brown',
      body: `<div class="pick-list">${friends.map((f) => `<div class="pick-row" style="color:var(--text)">${avatarHTML(f)}<div class="who"><strong>${esc(f.display_name)}</strong>${mbtiBadge(f.mbti)}</div></div>`).join('')}</div>`,
    });
  }
  function openFriend(id) {
    const f = friends.find((x) => x.id === id); if (!f) return;
    const prefs = Object.entries(f.prefs).flatMap(([k, arr]) => (arr || []).map((v) => (window.PREF_OPTIONS[k].find((o) => String(o[0]) === String(v)) || [])[1])).filter(Boolean);
    openModal({
      title: f.display_name, iconName: 'user',
      body: `<div style="text-align:center">${avatarHTML(f, 'lg')}<p>${mbtiBadge(f.mbti)}</p><p>${esc(f.bio)}</p></div>
        ${prefs.length ? `<p class="hint">สิ่งที่ชอบ</p><div class="member-chips">${prefs.map((p) => `<span class="chip static">${esc(p)}</span>`).join('')}</div>` : ''}`,
    });
  }

  /* ---------- QR ของฉัน (ให้เพื่อนสแกนเพื่อเพิ่มเพื่อน) ---------- */
  function openMyQR() {
    const url = new URL('join.html?friend=' + encodeURIComponent(me.id), location.href).href;
    openModal({
      theme: 'brown', noHead: true,
      body: `<div class="invite" style="grid-template-columns:1fr"><div>
          <h4>มาจอยกัน !</h4>
          <div class="qr-box"><div class="qr" id="qr"></div></div>
          <p class="qr-caption" style="font-size:18px;color:#fff;margin-top:16px"><b>${esc(me.display_name)}</b><br>${esc(me.email)}</p>
          <p class="qr-caption">รหัสเพื่อนของฉัน: <b style="font-size:20px;letter-spacing:3px">${esc(me.friend_code)}</b></p>
          <div class="modal-actions" style="justify-content:center"><button class="btn btn-yellow" data-close>ปิด</button></div>
        </div></div>`,
      onMount(el, close) {
        try { new QRCode(el.querySelector('#qr'), { text: url, width: 180, height: 180, colorDark: '#7F4D2F', colorLight: '#ffffff' }); } catch {}
        el.querySelector('[data-close]').onclick = close;
      },
    });
  }

  /* ---------- เพิ่มเพื่อน ---------- */
  function openAddFriend() {
    let scanner = null;
    openModal({
      title: 'เพิ่มเพื่อน', iconName: 'user',
      body: `
        <form id="af" novalidate>
          <div class="field"><label>รหัสเพื่อน หรือ อีเมลของเพื่อน</label>
            <div class="readonly-row"><input class="input" name="q" placeholder="เช่น AB12CD หรือ friend@email.com"><button class="btn btn-primary" type="submit">ค้นหา</button></div></div>
          <p class="error-text" id="af-err"></p>
          <div id="found"></div>
        </form>
        <hr class="form-sep">
        <div style="text-align:center">
          <button class="btn" id="scan-btn">${icon('camera')} สแกน QR ของเพื่อน</button>
          <div id="qr-reader" style="margin-top:12px"></div>
        </div>
        <hr class="form-sep">
        <div class="code-box"><p class="hint" style="margin:0">หรือให้เพื่อนกรอกรหัสของคุณ</p><span class="code">${esc(me.friend_code)}</span></div>`,
      onMount(el, close) {
        const f = el.querySelector('#af'), err = el.querySelector('#af-err'), found = el.querySelector('#found');
        const showFound = (p) => {
          const already = friends.some((x) => x.id === p.id);
          found.innerHTML = `<div class="pick-row">${avatarHTML(p)}<div class="who"><strong>${esc(p.display_name)}</strong>${mbtiBadge(p.mbti)}</div>
            <button type="button" class="add ${already ? 'on' : ''}" ${already ? 'disabled' : ''}>${icon(already ? 'check' : 'plusCircle')} ${already ? 'เป็นเพื่อนแล้ว' : 'เพิ่ม'}</button></div>`;
          const b = found.querySelector('button');
          if (!already) b.onclick = async () => {
            try { await KRD.api.addFriend(p.id); toast(`เป็นเพื่อนกับ ${p.display_name} แล้ว 🎉`); close(); load(); }
            catch (ex) { err.textContent = ex.message; }
          };
        };
        const lookup = async (q) => {
          err.textContent = ''; found.innerHTML = '';
          if (!q.trim()) { err.textContent = 'กรุณากรอกรหัสเพื่อนหรืออีเมล'; return; }
          try {
            const p = await KRD.api.findUser(q);
            if (!p) { err.textContent = 'ไม่พบผู้ใช้นี้'; return; }
            if (p.id === me.id) { err.textContent = 'นี่คือบัญชีของคุณเองนะ 😆'; return; }
            showFound(p);
          } catch (ex) { err.textContent = ex.message; }
        };
        f.addEventListener('submit', (e) => { e.preventDefault(); lookup(f.q.value); });

        el.querySelector('#scan-btn').onclick = async () => {
          if (!window.Html5Qrcode) { err.textContent = 'โหลดตัวสแกนไม่สำเร็จ'; return; }
          try {
            scanner = new Html5Qrcode('qr-reader');
            await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, async (text) => {
              await scanner.stop().catch(() => {}); scanner = null;
              el.querySelector('#qr-reader').innerHTML = '';
              try {
                const u = new URL(text);
                const id = u.searchParams.get('friend') || u.searchParams.get('host');
                if (!id) throw new Error();
                const p = (await KRD.api.getProfiles([id]))[0];
                if (!p) throw new Error();
                if (p.id === me.id) { err.textContent = 'นี่คือ QR ของคุณเองนะ 😆'; return; }
                showFound(p);
              } catch { err.textContent = 'QR นี้ไม่ใช่ของกินรัยดี'; }
            });
          } catch (ex) { err.textContent = 'เปิดกล้องไม่ได้ (ต้องอนุญาตกล้อง และเปิดผ่าน https หรือ localhost)'; }
        };
      },
      onClose() { if (scanner) scanner.stop().catch(() => {}); },
    });
  }

  /* ---------- สร้าง / แก้ไขกลุ่ม ---------- */
  function openGroupForm(group = null) {
    const editing = !!group;
    let photoBlob = null;
    const selected = new Set(editing ? group.members.map((m) => m.id).filter((id) => id !== me.id) : []);
    openModal({
      title: editing ? 'แก้ไขกลุ่ม' : 'สร้างกลุ่ม', iconName: 'users',
      body: `
        <form id="gf" novalidate>
          <div class="field"><label>รูปภาพกลุ่ม</label>
            <div class="group-photo-preview" id="gp">${editing && group.photo_url ? `<img src="${esc(group.photo_url)}" alt="">` : `${icon('image')}&nbsp;ยังไม่มีรูป`}</div>
            <div class="group-photo-pick">
              <label class="btn btn-sm">${icon('image')} อัปโหลด<input type="file" accept="image/*" hidden data-photo></label>
              <label class="btn btn-sm">${icon('camera')} ถ่ายรูป<input type="file" accept="image/*" capture="environment" hidden data-photo></label>
            </div></div>
          <div class="field"><label>ชื่อกลุ่ม</label>
            <input class="input" name="name" maxlength="40" placeholder="ตั้งชื่อกลุ่มของคุณ..." value="${editing ? esc(group.name) : ''}"></div>
          ${editing ? '' : `
          <div class="field"><label>สมาชิก <span class="hint" id="cnt">(${selected.size + 1} members)</span></label>
            ${friends.length ? `<div class="pick-list" style="max-height:260px">${friends.map((f) => `
              <div class="pick-row">${avatarHTML(f)}<div class="who"><strong>${esc(f.display_name)}</strong>${mbtiBadge(f.mbti)}</div>
              <button type="button" class="add" data-sel="${f.id}">${icon('plusCircle')} <span>เพิ่ม</span></button></div>`).join('')}</div>`
              : '<p class="hint">ยังไม่มีเพื่อน — สร้างกลุ่มไปก่อนแล้วค่อยเพิ่มสมาชิกทีหลังได้</p>'}
          </div>`}
          <p class="error-text" id="g-err"></p>
          <div class="modal-actions"><button type="button" class="btn" data-cancel>ยกเลิก</button>
            <button type="submit" class="btn btn-primary">${editing ? 'บันทึก' : 'สร้างกลุ่ม'}</button></div>
        </form>`,
      onMount(el, close) {
        const f = el.querySelector('#gf'), err = el.querySelector('#g-err');
        el.querySelector('[data-cancel]').onclick = close;
        el.querySelectorAll('[data-photo]').forEach((inp) => inp.addEventListener('change', async () => {
          const file = inp.files[0]; if (!file) return;
          photoBlob = await KRD.resizeImage(file, KRD.api.mode === 'demo' ? 400 : 900);
          el.querySelector('#gp').innerHTML = `<img src="${URL.createObjectURL(photoBlob)}" alt="">`;
          toast('เพิ่มรูปสำเร็จ ✓');
        }));
        el.querySelectorAll('[data-sel]').forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.sel;
          selected.has(id) ? selected.delete(id) : selected.add(id);
          const on = selected.has(id);
          b.classList.toggle('on', on);
          b.innerHTML = `${icon(on ? 'check' : 'plusCircle')} <span>${on ? 'เพิ่มแล้ว' : 'เพิ่ม'}</span>`;
          el.querySelector('#cnt').textContent = `(${selected.size + 1} members)`;
        }));
        f.addEventListener('submit', async (e) => {
          e.preventDefault(); err.textContent = '';
          const name = f.name.value.trim();
          if (!name) { err.textContent = 'กรุณาตั้งชื่อกลุ่ม'; return; }
          const btn = f.querySelector('[type=submit]'); btn.disabled = true;
          try {
            const photo_url = photoBlob ? await KRD.api.uploadImage(photoBlob, 'groups') : (editing ? group.photo_url : '');
            if (editing) await KRD.api.updateGroup(group.id, { name, photo_url });
            else await KRD.api.createGroup({ name, photo_url, member_ids: [...selected] });
            close();
            await load();
            if (!editing) successPop(`สร้างกลุ่ม "${name}" สำเร็จ!`);
            else toast('บันทึกกลุ่มแล้ว ✓');
          } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
        });
      },
    });
  }

  function successPop(msg) {
    openModal({
      noHead: true,
      body: `<div class="success-pop"><div class="big">🎉</div><h3>${esc(msg)}</h3><br><button class="btn btn-primary" data-ok>ตกลง</button></div>`,
      onMount(el, close) { el.querySelector('[data-ok]').onclick = close; },
    });
  }

  /* ---------- จัดการกลุ่ม ---------- */
  function openGroup(id) {
    const g = groups.find((x) => x.id === id); if (!g) return;
    const notIn = friends.filter((f) => !g.members.some((m) => m.id === f.id));
    openModal({
      title: g.name, iconName: 'users', wide: true,
      body: `
        <div class="group-photo-preview" style="aspect-ratio:16/7">${groupPhoto(g)}</div>
        <div class="field"><label>สมาชิก ${g.members.length} คน</label>
          <div class="pick-list" style="max-height:240px">${g.members.map((m) => `
            <div class="pick-row">${avatarHTML(m)}<div class="who"><strong>${esc(m.display_name)}${m.id === me.id ? ' (ฉัน)' : ''}${m.id === g.created_by ? ' 👑' : ''}</strong>${mbtiBadge(m.mbti)}</div>
            ${m.id !== me.id ? `<button class="add" data-kick="${m.id}">${icon('x')} เอาออก</button>` : ''}</div>`).join('')}</div></div>
        ${notIn.length ? `<div class="field"><label>เพิ่มเพื่อนเข้ากลุ่ม</label>
          <div class="pick-list" style="max-height:200px">${notIn.map((f) => `
            <div class="pick-row">${avatarHTML(f)}<div class="who"><strong>${esc(f.display_name)}</strong>${mbtiBadge(f.mbti)}</div>
            <button class="add" data-addm="${f.id}">${icon('plusCircle')} เพิ่ม</button></div>`).join('')}</div></div>` : ''}
        <div class="modal-actions" style="justify-content:space-between">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-sm" data-leave>${icon('logout')} ออกจากกลุ่ม</button>
            <button class="btn btn-sm btn-danger" data-del>${icon('trash')} ลบกลุ่ม</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-sm" data-edit>${icon('pencil')} แก้ไขชื่อ/รูป</button>
            <a class="btn btn-sm btn-primary" href="index.html" data-use>${icon('star')} สุ่มร้านกับกลุ่มนี้</a>
          </div>
        </div>`,
      onMount(el, close) {
        el.querySelectorAll('[data-kick]').forEach((b) => b.onclick = async () => {
          const m = g.members.find((x) => x.id === b.dataset.kick);
          if (!(await confirmModal({ title: 'เอาสมาชิกออก', message: `เอา ${m.display_name} ออกจากกลุ่มใช่ไหม ?`, okText: 'เอาออก', danger: true, iconName: 'users' }))) return;
          try { await KRD.api.removeGroupMember(g.id, m.id); close(); await load(); openGroup(g.id); } catch (e) { toast(e.message, 'error'); }
        });
        el.querySelectorAll('[data-addm]').forEach((b) => b.onclick = async () => {
          try { await KRD.api.addGroupMembers(g.id, [b.dataset.addm]); toast('เพิ่มเพื่อนเข้ากลุ่มสำเร็จ ✓'); close(); await load(); openGroup(g.id); } catch (e) { toast(e.message, 'error'); }
        });
        el.querySelector('[data-edit]').onclick = () => { close(); openGroupForm(g); };
        el.querySelector('[data-leave]').onclick = async () => {
          if (!(await confirmModal({ title: 'ออกจากกลุ่ม', message: `ออกจากกลุ่ม "${g.name}" ใช่ไหม ?`, okText: 'ออกจากกลุ่ม', danger: true, iconName: 'users' }))) return;
          try { await KRD.api.removeGroupMember(g.id, me.id); close(); load(); toast('ออกจากกลุ่มแล้ว'); } catch (e) { toast(e.message, 'error'); }
        };
        el.querySelector('[data-del]').onclick = async () => {
          if (!(await confirmModal({ title: 'ลบกลุ่ม', message: `ลบกลุ่ม "${g.name}" สำหรับทุกคนใช่ไหม ? (ย้อนกลับไม่ได้)`, okText: 'ลบกลุ่ม', danger: true, iconName: 'trash' }))) return;
          try { await KRD.api.deleteGroup(g.id); close(); load(); toast('ลบกลุ่มแล้ว'); } catch (e) { toast(e.message, 'error'); }
        };
        el.querySelector('[data-use]').onclick = () => {
          sessionStorage.setItem('krd_party', JSON.stringify(g.members.filter((m) => m.id !== me.id)));
        };
      },
    });
  }

  await load();
})();
