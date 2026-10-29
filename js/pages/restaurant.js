/* หน้ารายละเอียดร้าน (กด "อ่านต่อ" / ร้านโปรด / ร้านที่ดูล่าสุด) */
(async function () {
  const { icon, esc, qs } = KRD;
  const from = qs('from'); // fav | recent | (ไม่มี = มาจากหน้าแรก)
  const me = await KRD.boot(from ? 'history' : 'home');
  const r = KRD.getRestaurant(qs('id'));
  const page = document.getElementById('page');
  if (!r) {
    page.innerHTML = `<div class="container"><div class="empty-state" style="margin-top:48px"><div class="big">🍽️</div><h3>ไม่พบร้านนี้</h3><br><a class="btn btn-primary" href="index.html">กลับหน้าหลัก</a></div></div>`;
    return;
  }
  document.title = `${r.name} — กินรัยดี`;
  let favIds = [];
  if (me) { try { favIds = (await KRD.api.listFavorites()).map((f) => f.restaurant_id); } catch {} }

  const heading = from === 'fav' ? `${icon('heart', 'f-pet')} ร้านโปรดของฉัน`
    : from === 'recent' ? 'ร้านที่ดูล่าสุด'
    : `${esc(r.name)} <small>( ${esc(r.nameEn)} )</small>`;
  page.innerHTML = `
    <div class="container">
      <div class="page-head-row">
        <button class="back-btn" onclick="history.length > 1 ? history.back() : (location.href='index.html')" aria-label="ย้อนกลับ">${icon('chevronLeft')}</button>
        <h1>${heading}</h1>
      </div>
      ${KRD.detail.detailHTML(r, { fav: favIds.includes(r.id) })}
    </div>`;
  KRD.detail.bindGallery(page, r);
  if (!me) page.querySelectorAll('[data-fav]').forEach((b) => b.replaceWith(b.cloneNode(true)));
  if (!me) page.querySelectorAll('[data-fav]').forEach((b) => b.addEventListener('click', () => (location.href = 'login.html')));
})();
