/* หน้าเข้าสู่ระบบ */
(async function () {
  const { icon, logoHTML, qs, toast } = KRD;
  const me = await KRD.boot('profile');
  const next = qs('next') || 'index.html';
  if (me) { location.replace(next); return; }

  document.getElementById('page').innerHTML = `
    <div class="container"><div class="auth-wrap">
      ${logoHTML()}
      <h1>เข้าสู่บัญชีของคุณ</h1>
      <form id="f" novalidate>
        <div class="field"><div class="input-wrap">${icon('mail')}
          <input class="input" type="email" name="email" placeholder="อีเมล" autocomplete="email" required></div></div>
        <div class="field"><div class="input-wrap">${icon('lock')}
          <input class="input" type="password" name="password" placeholder="รหัสผ่าน" autocomplete="current-password" required>
          <button type="button" class="toggle-pw" aria-label="แสดงรหัสผ่าน">${icon('eye')}</button></div></div>
        <p class="error-text" id="err"></p>
        <button class="btn btn-primary btn-block" type="submit">เข้าสู่ระบบ</button>
      </form>
      <p class="auth-switch">ไม่มีบัญชีใช่มั้ย ? <a href="signup.html${next !== 'index.html' ? '?next=' + encodeURIComponent(next) : ''}">สมัครสมาชิก</a></p>
      ${KRD.api.mode === 'demo' ? `<div class="demo-accounts"><b>บัญชีทดลอง (โหมดเดโม)</b><br>
        <code>poy@demo.com</code> / <code>123456</code> — มีเพื่อนและกลุ่มพร้อมใช้<br>
        เพื่อนคนอื่น: money@ tan@ kao@ regency@ gam@ tako@ prib@ (…@demo.com รหัส 123456)</div>` : ''}
    </div></div>`;

  bindPwToggles();
  const f = document.getElementById('f'), err = document.getElementById('err');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const email = f.email.value.trim(), pw = f.password.value;
    if (!email || !pw) { err.textContent = 'กรุณากรอกอีเมลและรหัสผ่าน'; return; }
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      await KRD.api.signIn(email, pw);
      toast('ยินดีต้อนรับกลับมา 🎉');
      location.replace(next);
    } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
  });
})();

function bindPwToggles() {
  document.querySelectorAll('.toggle-pw').forEach((b) => b.addEventListener('click', () => {
    const inp = b.parentElement.querySelector('input');
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.innerHTML = KRD.icon(show ? 'eyeOff' : 'eye');
  }));
}
