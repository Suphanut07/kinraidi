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
  const fmt = (iso) => new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });

  document.title = (type === 'fav' ? 'ร้านโปรดของฉัน' : 'ร้านที่ดูล่าสุด') + ' — กินรัยดี';
  document.getElementById('page').innerHTML = `
    <div class="container">
      <div class="page-head-row">
        <a class="back-btn" href="history.html" aria-label="กลับ">${icon('chevronLeft')}</a>
        <h1>${type === 'fav' ? `${icon('heart', 'f-pet')} ร้านโปรดของฉัน` : `${icon('clock')} ร้านที่ดูล่าสุด`}</h1>
      </div>
      <div style="margin-top:20px">
      ${ids.length ? `<div class="grid-4">${ids.map(KRD.getRestaurant).filter(Boolean).map((r) => {
          let card = restaurantCard(r, { fav: favIds.includes(r.id) }).replaceAll(`restaurant.html?id=${r.id}`, `restaurant.html?id=${r.id}&from=${type}`);
          if (type === 'recent') card = card.replace('<p>', `<p class="when">สุ่มได้เมื่อ ${fmt(whenOf[r.id])}</p><p>`);
          return card;
        }).join('')}</div>`
        : `<div class="empty-state"><div class="big">${type === 'fav' ? '💛' : '🎲'}</div><h3>ยังไม่มีข้อมูล</h3><br><a class="btn btn-primary" href="index.html">ไปสุ่มร้านกัน</a></div>`}
      </div>
    </div>`;
  bindFavButtons(document.getElementById('page'));
})();
