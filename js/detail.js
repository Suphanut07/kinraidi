/* =========================================================
   ส่วนแสดงรายละเอียดร้าน (ใช้ร่วมกันในหน้า result / restaurant)
   topHTML    = การ์ดร้าน + แผนที่
   bottomHTML = บรรยากาศ + เมนู + เครดิตภาพ
   (หน้า result แทรกการ์ด "ทำไมถึงเป็นร้านนี้" ไว้ระหว่าง 2 ส่วนนี้)
   ========================================================= */
(function () {
  const { icon, esc, rImg, featIcons, mapsLink, mapsEmbed, hoursText } = KRD;

  function topHTML(r, { fav = false } = {}) {
    return `
      <div class="detail-top">
        <article class="card detail-main">
          <div class="gallery" data-gallery="${r.id}" data-n="1">
            <div class="gallery-img">${rImg(r, 1)}</div>
            <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${r.id}" aria-label="ร้านโปรด">${icon(fav ? 'heart' : 'heartOutline')}</button>
            <button class="gallery-next" aria-label="รูปถัดไป">${icon('chevronRight')}</button>
          </div>
          <div class="detail-info">
            <div class="detail-title">
              <h2>${esc(r.name)}</h2>
              ${featIcons(r, 6)}
            </div>
            <div class="detail-desc">
              <p>${esc(r.desc)}</p>
              <p class="hours">${hoursText(r)}</p>
            </div>
            <div class="tags">
              ${r.cats.map((c) => `<span class="tag">${window.LABELS.cats[c]}</span>`).join('')}
              <span class="tag tag-price">${window.LABELS.price[r.price]}</span>
            </div>
          </div>
        </article>
        <article class="card detail-map">
          <div class="map-frame">
            <iframe title="แผนที่ ${esc(r.name)}" src="${mapsEmbed(r)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <a class="btn btn-primary" href="${mapsLink(r)}" target="_blank" rel="noopener">${icon('pin')} ค้นหาเส้นทาง</a>
        </article>
      </div>`;
  }

  function bottomHTML(r) {
    return `
      <div class="detail-bottom">
        <article class="card photo-card">
          <div class="photo">${rImg(r, 2)}</div>
          <h3>บรรยากาศภายในร้าน</h3>
        </article>
        <article class="card photo-card">
          <div class="photo">${rImg(r, 3)}</div>
          <h3>เมนูอาหาร &amp; เครื่องดื่ม</h3>
        </article>
      </div>
      <p class="photo-credit">ภาพประกอบ: ${esc(r.photoCredit || 'รวบรวมจากอินเทอร์เน็ตเพื่อการศึกษา ลิขสิทธิ์เป็นของร้านและเจ้าของภาพ')}</p>`;
  }

  function detailHTML(r, opts = {}) { return topHTML(r, opts) + bottomHTML(r); }

  // เลื่อนดูรูปร้าน 1 → 2 → 3
  function bindGallery(root, r) {
    root.querySelectorAll('[data-gallery]').forEach((g) => {
      g.querySelector('.gallery-next').addEventListener('click', () => {
        const n = (Number(g.dataset.n) % 3) + 1;
        g.dataset.n = n;
        g.querySelector('.gallery-img').innerHTML = rImg(r, n);
      });
    });
    KRD.bindFavButtons(root);
  }

  KRD.detail = { detailHTML, topHTML, bottomHTML, bindGallery };
})();
