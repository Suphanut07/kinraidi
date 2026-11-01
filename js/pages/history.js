/* หน้าประวัติของฉัน: ร้านโปรด + ร้านที่ดูล่าสุด (= ร้านที่สุ่มได้) */
(async function () {
  const { icon, restaurantCard, bindFavButtons, toast } = KRD;
  const me = await KRD.boot('history');
  if (!me) { location.replace('login.html?next=history.html'); return; }

  let favs = [], hist = [];
  try { [favs, hist] = await Promise.all([KRD.api.listFavorites(), KRD.api.listHistory()]); } catch (e) { toast(e.message, 'error'); }
  const favIds = favs.map((f) => f.restaurant_id);
  // ร้านล่าสุด: ไม่ซ้ำร้าน เรียงจากล่าสุด
  const recentIds = [...new Set(hist.map((h) => h.restaurant_id))];
  const toCards = (ids, from) => ids.map(KRD.getRestaurant).filter(Boolean).slice(0, 4)
    .map((r) => restaurantCard(r, { fav: favIds.includes(r.id) }).replaceAll(`restaurant.html?id=${r.id}`, `restaurant.html?id=${r.id}&from=${from}`)).join('');

  document.getElementById('page').innerHTML = `
    <div class="container hist-page">
      <div class="page-title"><h1>ประวัติของฉัน</h1><p>รวมร้านโปรดและร้านอาหารที่คุณเคยสุ่มได้ไว้ในที่เดียว</p></div>

      <section class="hist-section">
        <div class="hist-head">
          <div><h2>${icon('heart', 'red')} ร้านโปรด</h2><p>รวมร้านที่คุณถูกใจไว้ กลับมาดูได้ทุกเมื่อ</p></div>
          ${favIds.length ? `<a href="history-list.html?type=fav">ดูทั้งหมด ${icon('chevronRight')}</a>` : ''}
        </div>
        ${favIds.length ? `<div class="grid-4">${toCards(favIds, 'fav')}</div>` : `
          <div class="empty-state mascot-empty">${KRD.assetImg('mascot/fav.png', { cls: 'mascot', alt: 'เกี๊ยวน้อยกอดหัวใจ', emoji: '💛' })}<h3>ยังไม่มีร้านโปรดเลย!</h3>
          <p>เจอร้านที่ใช่แล้วอย่าปล่อยให้หลุดมือ! กดหัวใจเก็บไว้ แล้วค่อยกลับมาฟินกันอีกที</p></div>`}
      </section>

      <section class="hist-section">
        <div class="hist-head">
          <div><h2>${icon('clock', 'green')} ร้านที่ดูล่าสุด</h2><p>ร้านที่คุณเพิ่งสุ่มได้ เพื่อเลือกมื้อถัดไปได้ง่ายขึ้น</p></div>
          ${recentIds.length ? `<a href="history-list.html?type=recent">ดูทั้งหมด ${icon('chevronRight')}</a>` : ''}
        </div>
        ${recentIds.length ? `<div class="grid-4">${toCards(recentIds, 'recent')}</div>` : `
          <div class="empty-state mascot-empty">${KRD.assetImg('mascot/recent.png', { cls: 'mascot', alt: 'ชามข้าวนักสืบ', emoji: '🔍' })}<h3>ยังไม่ได้แวะร้านไหนเลย!</h3>
          <p>ร้านที่สุ่มได้จะอยู่ที่นี่ กลับมาดูเมื่อไหร่ก็ได้ ไม่ต้องกลัวหาร้านไม่เจอ</p><br>
          <a class="btn btn-primary" href="index.html">ไปสุ่มร้านกัน</a></div>`}
      </section>
    </div>`;
  bindFavButtons(document.getElementById('page'));
})();
