/* หน้าสมัครสมาชิก */
(async function () {
  const { icon, logoHTML, qs, toast } = KRD;
  const me = await KRD.boot('profile');
  if (me) { location.replace('profile.html'); return; }
  const next = qs('next') || 'profile.html?welcome=1';

  document.getElementById('page').innerHTML = `
    <div class="container"><div class="auth-wrap">
      ${logoHTML()}
      <h1>สมัครสมาชิกของคุณ</h1>
      <form id="f" novalidate>
        <div class="field"><div class="input-wrap">${icon('mail')}
          <input class="input" type="email" name="email" placeholder="อีเมล *" autocomplete="email" required></div></div>
        <div class="field"><div class="input-wrap">${icon('lock')}
          <input class="input" type="password" name="password" placeholder="รหัสผ่าน * (อย่างน้อย 6 ตัว)" autocomplete="new-password" required>
          <button type="button" class="toggle-pw" aria-label="แสดงรหัสผ่าน">${icon('eye')}</button></div></div>
        <div class="field"><div class="input-wrap">${icon('lock')}
          <input class="input" type="password" name="confirm" placeholder="ยืนยันรหัสผ่าน *" autocomplete="new-password" required>
          <button type="button" class="toggle-pw" aria-label="แสดงรหัสผ่าน">${icon('eye')}</button></div></div>
        <p class="error-text" id="err"></p>
        <button class="btn btn-primary btn-block" type="submit">ลงทะเบียน</button>
      </form>
      <p class="auth-switch">มีบัญชีอยู่แล้ว ? <a href="login.html">เข้าสู่ระบบ</a></p>
    </div></div>`;

  document.querySelectorAll('.toggle-pw').forEach((b) => b.addEventListener('click', () => {
    const inp = b.parentElement.querySelector('input');
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.innerHTML = icon(show ? 'eyeOff' : 'eye');
  }));

  const f = document.getElementById('f'), err = document.getElementById('err');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const email = f.email.value.trim(), pw = f.password.value, cf = f.confirm.value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'รูปแบบอีเมลไม่ถูกต้อง'; return; }
    if (pw.length < 6) { err.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'; return; }
    if (pw !== cf) { err.textContent = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'; return; }
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      await KRD.api.signUp(email, pw);
      toast('สมัครสมาชิกสำเร็จ 🎉');
      location.replace(next);
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  });
})();
