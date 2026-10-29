/* =========================================================
   หน้าปลายทางเมื่อสแกน QR
   - join.html?host=<id>   : เข้าร่วมมื้อนี้กับเพื่อน (+ เป็นเพื่อนกันอัตโนมัติ)
   - join.html?friend=<id> : เพิ่มเพื่อน
   ========================================================= */
(async function () {
  const { esc, avatarHTML, mbtiBadge, qs, toast } = KRD;
  const hostId = qs('host'), friendId = qs('friend');
  const targetId = hostId || friendId;
  const me = await KRD.boot('member');
  const page = document.getElementById('page');
  if (!me) { location.replace('login.html?next=' + encodeURIComponent('join.html' + location.search)); return; }

  const target = targetId ? (await KRD.api.getProfiles([targetId]).catch(() => []))[0] : null;
  if (!target) {
    page.innerHTML = `<div class="container"><div class="join-card"><h1>ไม่พบผู้ใช้</h1><p>QR นี้อาจไม่ถูกต้อง</p><div class="actions"><a class="btn btn-yellow" href="index.html">กลับหน้าหลัก</a></div></div></div>`;
    return;
  }
  if (target.id === me.id) {
    page.innerHTML = `<div class="container"><div class="join-card"><h1>นี่คือ QR ของคุณเอง 😆</h1><p>ให้เพื่อนเป็นคนสแกนนะ</p><div class="actions"><a class="btn btn-yellow" href="index.html">กลับหน้าหลัก</a></div></div></div>`;
    return;
  }

  page.innerHTML = `
    <div class="container"><div class="join-card">
      <h1>มาจอยกัน !</h1>
      ${avatarHTML(target)}
      <p style="font-size:22px"><b>${esc(target.display_name)}</b> ${mbtiBadge(target.mbti)}</p>
      <p>${hostId ? 'ชวนคุณไปกินข้าวมื้อนี้ด้วยกัน 🍽️' : 'อยากเป็นเพื่อนกับคุณบนกินรัยดี'}</p>
      <p style="font-size:13px;opacity:.85">ระบบจะใช้ MBTI และ "สิ่งที่ฉันชอบ" ในโปรไฟล์ของคุณช่วยเลือกร้าน</p>
      <div class="actions">
        <button class="btn btn-yellow" id="go">${hostId ? 'เข้าร่วมมื้อนี้' : 'เพิ่มเป็นเพื่อน'}</button>
        <a class="btn" href="profile.html">ตรวจสิ่งที่ฉันชอบก่อน</a>
      </div>
    </div></div>`;

  document.getElementById('go').addEventListener('click', async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try {
      await KRD.api.addFriend(target.id);
      if (hostId) await KRD.api.joinMeal(hostId);
      page.querySelector('.join-card').innerHTML = `<h1>เรียบร้อย ! 🎉</h1>
        <p>${hostId ? `คุณเข้าร่วมมื้อนี้กับ ${esc(target.display_name)} แล้ว<br>รอเพื่อนกดสุ่มบนเครื่องของเขาได้เลย` : `คุณกับ ${esc(target.display_name)} เป็นเพื่อนกันแล้ว`}</p>
        <div class="actions"><a class="btn btn-yellow" href="member.html">ไปหน้าสมาชิก</a></div>`;
    } catch (ex) { toast(ex.message, 'error'); b.disabled = false; }
  });
})();
