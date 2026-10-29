/* =========================================================
   หน้าสมาชิก: กลุ่มของฉัน + รายชื่อสมาชิก (พับ/กางได้ทั้งสองส่วน)
   - การ์ด "สร้างกลุ่มใหม่" และ "เพิ่ม" อยู่เป็นการ์ดแรกเสมอ
   - สร้างกลุ่ม (ชื่อ, รูปจากอัปโหลด/กล้อง, เลือกสมาชิก)
   - จัดการกลุ่ม (สมาชิกทุกคนทำได้): เปลี่ยนชื่อ/รูป, เพิ่ม/เอาออก, ออกจากกลุ่ม, ลบกลุ่ม
   - เพิ่มเพื่อน → popup "มาจอยกัน !" (สแกน QR บนมือถือ/แท็บเล็ต · QR ของฉัน · รหัสเพื่อน) เป็นเพื่อนกันทันที
   ========================================================= */
(async function () {
  const { icon, esc, avatarHTML, mbtiBadge, openModal, confirmModal, toast } = KRD;
  const me = await KRD.boot('member');
  if (!me) { location.replace('login.html?next=member.html'); return; }
  const page = document.getElementById('page');
  let friends = [], groups = [];

  // จำว่าส่วนไหนพับไว้ (ค่าเริ่มต้น = กางทั้งหมด)
  const FOLD_KEY = 'krd_member_fold';
  let fold = {};
  try { fold = JSON.parse(localStorage.getItem(FOLD_KEY)) || {}; } catch {}
  const saveFold = () => { try { localStorage.setItem(FOLD_KEY, JSON.stringify(fold)); } catch {} };

  async function load() {
    try { [friends, groups] = await Promise.all([KRD.api.listFriends(), KRD.api.listGroups()]); }
    catch (e) { toast(e.message, 'error'); }
    render();
  }

  const groupPhoto = (g) => g.photo_url ? `<img src="${esc(g.photo_url)}" alt="">` : `<div class="ph ph-${g.name.length % 4}">👥</div>`;

  function sectionHead(key, iconName, title, count) {
    const open = !fold[key];
    return `<button class="bar-head bar-toggle" data-fold="${key}" aria-expanded="${open}">
        <h2>${icon(iconName)} ${title} <span class="bar-count">(${count})</span></h2>
        <span class="fold-caret ${open ? 'open' : ''}">${icon('chevronDown')}</span>
      </button>`;
  }

  function render() {
    page.innerHTML = `
      <div class="container">
        <div class="page-title"><h1>สมาชิก!</h1><p>หาเพื่อนร่วมแก๊งแล้วไปหาร้านอร่อยด้วยกัน</p></div>

        <section class="member-section">
          ${sectionHead('groups', 'users', 'กลุ่มของฉัน', groups.length)}
          <div class="group-grid ${fold.groups ? 'hidden' : ''}">
            <button class="group-card create" id="create-group">
              <span class="plus">${icon('plus')}</span>
              <h3>สร้างกลุ่มใหม่</h3>
              <p>ชวนเพื่อนมารวมแก๊ง<br>ค้นหาร้านอร่อยไปด้วยกัน!</p>
            </button>
            ${groups.map((g) => `
              <button class="group-card" data-group="${g.id}">
                <div class="photo">${groupPhoto(g)}</div>
                <div class="info"><h3>${esc(g.name)}</h3><span class="count">${icon('users')} ${g.members.length} members</span></div>
              </button>`).join('')}
          </div>
        </section>

        <section class="member-section">
          ${sectionHead('friends', 'user', 'รายชื่อสมาชิก', friends.length)}
          <div class="friend-grid ${fold.friends ? 'hidden' : ''}">
            <button class="friend-card add-card" id="add-friend"><span class="plus">${icon('plus')}</span><span class="name">เพิ่ม</span></button>
            ${friends.map(friendCard).join('')}
          </div>
        </section>
      </div>`;

    page.querySelectorAll('[data-fold]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.fold; fold[k] = !fold[k]; saveFold();
      b.nextElementSibling.classList.toggle('hidden', fold[k]);
      b.setAttribute('aria-expanded', !fold[k]);
      b.querySelector('.fold-caret').classList.toggle('open', !fold[k]);
    }));
    page.querySelectorAll('[data-group]').forEach((b) => b.addEventListener('click', () => openGroup(b.dataset.group)));
    page.querySelectorAll('[data-friend]').forEach((b) => b.addEventListener('click', () => {
      const f = friends.find((x) => x.id === b.dataset.friend);
      if (f) KRD.people.personPopup(f);
    }));
    document.getElementById('create-group').onclick = () => openGroupForm();
    document.getElementById('add-friend').onclick = () => KRD.people.joinPopup(me, { mode: 'friend', onAdded: () => load() });
  }
  const friendCard = (f) => `
    <button class="friend-card" data-friend="${f.id}">${avatarHTML(f)}
      <span style="min-width:0"><span class="name">${esc(f.display_name)}</span>${mbtiBadge(f.mbti)}</span></button>`;

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
