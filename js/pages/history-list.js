/* หน้า "ดูทั้งหมด" ของร้านโปรด (type=fav) หรือร้านที่ดูล่าสุด (type=recent) */
(async function () {
  const { icon, restaurantCard, bindFavButtons, qs, toast } = KRD;
  const type = qs('type') === 'recent' ? 'recent' : 'fav';
  const me = await KRD.boot('history');
  if (!me) { location.replace('login.html?next=' + encodeURIComponent('history-list.html?type=' + type)); return; }

  let favs = [], hist = [];
  try { [favs, hist] = await Promise.all([KRD.api.listFavorites(), KRD.api.listHistory()]); } catch (e) { toast(e.message, 'error'); }
  const favIds = favs.map((f) => f.restaurant_id);
  const whenOf = {};
  hist.forEach((h) => { if (!whenOf[h.restaurant_id]) whenOf[h.restaurant_id] = h.created_at; });
  const ids = type === 'fav' ? favIds : Object.keys(whenOf);

  document.title = type === 'fav' ? 'ร้านโปรดของฉัน' : 'ร้านที่ดูล่าสุด';
  document.getElementById('page').innerHTML = `
    <div class="container">
      <div class="page-head-row">
        <a class="back-btn" href="history.html" aria-label="กลับ">${icon('chevronLeft')}</a>
        <h1>${type === 'fav' ? `${icon('heart', 'red')} ร้านโปรดของฉัน` : `${icon('clock', 'green')} ร้านที่ดูล่าสุด`}</h1>
      </div>
      <div style="margin-top:20px">
      ${ids.length ? `<div class="grid-4">${ids.map(KRD.getRestaurant).filter(Boolean).map((r) =>
          restaurantCard(r, { fav: favIds.includes(r.id) }).replaceAll(`restaurant.html?id=${r.id}`, `restaurant.html?id=${r.id}&from=${type}`)).join('')}</div>`
        : type === 'fav'
          ? `<div class="empty-state mascot-empty">${KRD.assetImg('mascot/fav.png', { cls: 'mascot', alt: 'เกี๊ยวน้อยกอดหัวใจ', emoji: '💛' })}<h3>ยังไม่มีร้านโปรดเลย!</h3><p>เจอร้านที่ใช่แล้วอย่าปล่อยให้หลุดมือ! กดหัวใจเก็บไว้ แล้วค่อยกลับมาฟินกันอีกที</p></div>`
          : `<div class="empty-state mascot-empty">${KRD.assetImg('mascot/recent.png', { cls: 'mascot', alt: 'ชามข้าวนักสืบ', emoji: '🔍' })}<h3>ยังไม่ได้แวะร้านไหนเลย!</h3><p>ร้านที่สุ่มได้จะอยู่ที่นี่ กลับมาดูเมื่อไหร่ก็ได้</p><br><a class="btn btn-primary" href="index.html">ไปสุ่มร้านกัน</a></div>`}
      </div>
    </div>`;
  bindFavButtons(document.getElementById('page'));
})();
