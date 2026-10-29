/* =========================================================
   UI helpers: ไอคอน, header/footer, modal, toast, การ์ดร้าน, avatar
   ========================================================= */
(function () {
  const P = {
    heart: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z',
    heartOutline: 'M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21zm0-2.4c2.2-1.5 5.9-4.5 7-7.4.9-2.3-.4-4.7-2.7-4.7-1.6 0-2.8 1-3.3 2.4h-2c-.5-1.4-1.7-2.4-3.3-2.4-2.3 0-3.6 2.4-2.7 4.7 1.1 2.9 4.8 5.9 7 7.4z',
    user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z',
    userCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.2a7.8 7.8 0 0 1 6.1 12.7c-1.3-1.6-3.6-2.6-6.1-2.6s-4.8 1-6.1 2.6A7.8 7.8 0 0 1 12 4.2zm0 2.3a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z',
    users: 'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 13c-3.3 0-6 1.8-6 4.2V20h12v-2.8C14 14.8 11.3 13 8 13zm8 .2c-.6 0-1.2.1-1.8.2 1 .9 1.8 2.2 1.8 3.8V20h6v-2.6c0-2.3-2.7-4.2-6-4.2z',
    utensils: 'M7 2v7H5V2H3v7a3 3 0 0 0 2 2.8V22h2V11.8A3 3 0 0 0 9 9V2H7zm10 0c-2.2 0-4 2.7-4 6v5h3v9h2V2h-1z',
    wallet: 'M3 6a3 3 0 0 1 3-3h12v3h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V6zm3-1a1 1 0 0 0 0 2h10V5H6zm11 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    mountain: 'M18 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM9 7l9 14H0L9 7z',
    gear: 'M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1L11 21h4l.4-2.9a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5-2.2-1.6zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
    key: 'M14 2a8 8 0 0 0-7.6 10.5L2 17v5h5v-2h2v-2h2l1.5-1.5A8 8 0 1 0 14 2zm2.5 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
    bell: 'M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.8V3a1.5 1.5 0 0 0-3 0v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z',
    logout: 'M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V5h5V3zm6.5 4.5L15 9l2 2H9v2h8l-2 2 1.5 1.5L21 12l-4.5-4.5z',
    chevronRight: 'M9 4.5 7.5 6l6 6-6 6L9 19.5 16.5 12 9 4.5z',
    chevronDown: 'M4.5 9 6 7.5l6 6 6-6L19.5 9 12 16.5 4.5 9z',
    chevronLeft: 'M15 4.5 16.5 6l-6 6 6 6-1.5 1.5L7.5 12 15 4.5z',
    arrowRight: 'M13 5l-1.4 1.4 4.6 4.6H3v2h13.2l-4.6 4.6L13 19l7-7-7-7z',
    search: 'M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    plus: 'M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z',
    plusCircle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7h2z',
    x: 'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6 6.4 5z',
    pencil: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z',
    camera: 'M9 3 7.5 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5L15 3H9zm3 5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z',
    image: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 10h16l-5-7-4 5-3-3-4 5z',
    pin: 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
    snow: 'M11 2h2v3.6l2.3-2.3 1.4 1.4L13 8.4v2.9l2.5-1.5 1.3-5 1.9.5-.8 3.1 3.1-1.8 1 1.7-3.1 1.8 3.1.8-.5 1.9-5-1.3L14 12l2.5 1.5 5-1.3.5 1.9-3.1.8 3.1 1.8-1 1.7-3.1-1.8.8 3.1-1.9.5-1.3-5L13 12.7v2.9l3.7 3.7-1.4 1.4-2.3-2.3V22h-2v-3.6l-2.3 2.3-1.4-1.4 3.7-3.7v-2.9l-2.5 1.5-1.3 5-1.9-.5.8-3.1-3.1 1.8-1-1.7 3.1-1.8-3.1-.8.5-1.9 5 1.3L10 12 7.5 10.5l-5 1.3L2 9.9l3.1-.8L2 7.3l1-1.7 3.1 1.8-.8-3.1 1.9-.5 1.3 5L11 10.3V7.4L7.3 3.7l1.4-1.4L11 4.6V2z',
    face: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 15h8v1.5H8V15z',
    paw: 'M12 12c-3 0-6 3.6-6 6.1 0 1.6 1.3 2.4 2.8 2.4 1.3 0 2-.7 3.2-.7s1.9.7 3.2.7c1.5 0 2.8-.8 2.8-2.4C18 15.6 15 12 12 12zM5 9a2 2.5 0 1 0 0 5 2 2.5 0 0 0 0-5zm14 0a2 2.5 0 1 0 0 5 2 2.5 0 0 0 0-5zM9 3.5a2.2 2.8 0 1 0 0 5.6 2.2 2.8 0 0 0 0-5.6zm6 0a2.2 2.8 0 1 0 0 5.6 2.2 2.8 0 0 0 0-5.6z',
    wifi: 'M12 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 13c2.2 0 4.2.9 5.7 2.3l-1.5 1.5A6 6 0 0 0 12 15a6 6 0 0 0-4.2 1.8l-1.5-1.5A8 8 0 0 1 12 13zm0-5c3.6 0 6.9 1.5 9.2 3.8l-1.5 1.5A11 11 0 0 0 12 10a11 11 0 0 0-7.7 3.3l-1.5-1.5A13 13 0 0 1 12 8z',
    car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v5h-2v2h-2v-2H7v2H5v-2H3v-5a2 2 0 0 1 2-2zm2.1 0h9.8l-1-3H8.1l-1 3zM6.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    sun: 'M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm-1-6h2v3h-2V1zm0 19h2v3h-2v-3zM1 11h3v2H1v-2zm19 0h3v2h-3v-2zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1-1.4-1.4z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v5.2l3.6 2.1-1 1.7L11 13.3V7h2z',
    history: 'M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2.1 5l-1.4 1.4A9 9 0 1 0 13 3zm-1 5v5l4.3 2.5.7-1.2-3.5-2.1V8H12z',
    home: 'M12 3 2 11.5h3V21h5v-6h4v6h5v-9.5h3L12 3z',
    menu: 'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
    qr: 'M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h4v2h-4v-2zm-4 4h2v4h-2v-4zm4 0h4v4h-2v-2h-2v-2zm0 4h2v0z',
    star: 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z',
    leaf: 'M20 3s-9 0-13 4c-3.2 3.2-2.7 7.4-1.4 9.5L3 19l1.4 1.4 2.6-2.6c2.1 1.3 6.3 1.8 9.5-1.4C20.5 12.4 20 3 20 3z',
    target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    eye: 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z',
    eyeOff: 'M3.3 2 2 3.3l3.2 3.2C3.3 8 2 10 2 12c0 0 4 7 10 7 2 0 3.7-.6 5.2-1.6l3.5 3.5 1.3-1.3L3.3 2zM12 16a4 4 0 0 1-3.9-4.8l4.7 4.7c-.3.1-.5.1-.8.1zm0-11c-1.3 0-2.6.3-3.7.8l2 2a4 4 0 0 1 5 5l2.8 2.8C20.8 14.1 22 12 22 12s-4-7-10-7z',
    mail: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.2V17h16V7.2l-8 5.3-8-5.3zM5.6 7l6.4 4.2L18.4 7H5.6z',
    lock: 'M12 2a5 5 0 0 0-5 5v3H5v12h14V10h-2V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9zm3 4a2 2 0 0 1 1 3.7V20h-2v-2.3A2 2 0 0 1 12 14z',
    trash: 'M9 3h6l1 2h4v2H4V5h4l1-2zM5 9h14l-1 12H6L5 9z',
    share: 'M18 16a3 3 0 0 0-2.4 1.2l-7-3.5a3 3 0 0 0 0-1.4l7-3.5A3 3 0 1 0 15 7c0 .2 0 .5.1.7l-7 3.5a3 3 0 1 0 0 3.6l7 3.5A3 3 0 1 0 18 16z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
  };

  function icon(name, cls = '') {
    const d = P[name] || P.star;
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  // ลูกเต๋า (ใช้ในปุ่มสุ่มและ animation)
  function diceSVG(size = 120) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
      <rect x="44" y="38" width="64" height="64" rx="14" fill="#7F4D2F" transform="rotate(14 76 70)"/>
      <rect x="12" y="10" width="68" height="68" rx="16" fill="#7F4D2F" stroke="#fff" stroke-width="6" transform="rotate(-12 46 44)"/>
      <g fill="#fff" transform="rotate(-12 46 44)">
        <circle cx="30" cy="28" r="7"/><circle cx="62" cy="28" r="7"/><circle cx="46" cy="44" r="7"/><circle cx="30" cy="60" r="7"/><circle cx="62" cy="60" r="7"/>
      </g></svg>`;
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Logo ---------- */
  /* รูปภาพ: ลองไฟล์ในโฟลเดอร์ assets/ ก่อน → ถ้าไม่มีใช้รูปบน Supabase Storage → ถ้าไม่มีอีกใช้ fallback */
  function assetImg(path, { cls = '', alt = '', ph = '', emoji = '', text = '', lazy = true } = {}) {
    const base = (window.KRD_CONFIG || {}).IMG_BASE;
    return `<img class="${cls}" src="assets/${path}" alt="${esc(alt)}" ${lazy ? 'loading="lazy"' : ''}
      ${base ? `data-alt="${base}/${path}"` : ''} data-ph="${ph}" data-emoji="${esc(emoji)}" data-text="${esc(text)}" onerror="KRD.imgFail(this)">`;
  }
  function logoHTML(cls = '') {
    return `<span class="logo ${cls}">${assetImg('logo.png', { alt: 'กินรัยดี', text: 'กิน-รัย-ดี', lazy: false })}</span>`;
  }

  /* ---------- Header / Footer ---------- */
  const NAV = [
    { href: 'index.html', label: 'สุ่มเลย !', key: 'home', icon: 'home', mobileLabel: 'หน้าหลัก' },
    { href: 'member.html', label: 'สมาชิก', key: 'member', icon: 'users' },
    { href: 'history.html', label: 'ประวัติ', key: 'history', icon: 'history' },
  ];

  function renderHeader(active, opts = {}) {
    const me = opts.me;
    const avatar = me && me.avatar_url ? `<img src="${esc(me.avatar_url)}" alt="">` : icon('userCircle');
    // บนมือถือหน้า result: "สุ่มเลย !" = สุ่มใหม่ทันที
    const mobileLinks = NAV.map((n) => {
      if (n.key === 'home' && opts.onMobileReroll) {
        return `<a href="#" data-reroll>${icon('star')} สุ่มเลย !</a>`;
      }
      return `<a href="${n.href}" class="${active === n.key ? 'active' : ''}">${icon(n.icon)} ${n.mobileLabel || n.label}</a>`;
    }).join('') + `<a href="profile.html" class="${active === 'profile' ? 'active' : ''}">${icon('user')} โปรไฟล์</a>`;

    const html = `
      ${KRD.api && KRD.api.mode === 'demo' ? '<div class="demo-banner">โหมดเดโม — ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น (ใส่ค่า Supabase ใน js/config.js เพื่อใช้งานจริง)</div>' : ''}
      <header class="site-header">
        <div class="container">
          <a href="index.html" aria-label="หน้าหลัก">${logoHTML()}</a>
          <nav class="main-nav">
            ${NAV.map((n) => `<a href="${n.href}" class="${active === n.key ? 'active' : ''}">${n.label}</a>`).join('')}
            <a href="profile.html" class="nav-avatar" aria-label="โปรไฟล์">${avatar}</a>
          </nav>
          <button class="menu-btn" aria-label="เมนู" aria-expanded="false">${icon('menu')}</button>
        </div>
      </header>
      <nav class="mobile-menu">${mobileLinks}</nav>`;
    const holder = document.getElementById('site-header');
    holder.innerHTML = html;
    const btn = holder.querySelector('.menu-btn');
    const menu = holder.querySelector('.mobile-menu');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) menu.classList.remove('open'); });
    const rr = holder.querySelector('[data-reroll]');
    if (rr) rr.addEventListener('click', (e) => { e.preventDefault(); menu.classList.remove('open'); opts.onMobileReroll(); });
  }

  // โลโก้โซเชียล (สัญลักษณ์ทางการ) — ตอนนี้เป็นของตกแต่ง ยังไม่ลิงก์ไปไหน
  const SOCIAL_ICONS = `
    <span class="soc soc-tiktok" title="TikTok"><svg viewBox="0 0 24 24"><path fill="#25F4EE" d="M11.4 1h3.5c.2 2.2 1.6 4 3.9 4.3v3.4c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.4-2.8 6.1-6.2 6.1S2.5 17.6 2.5 14.2s2.8-6.1 6.2-6.1c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V1z" transform="translate(-.7 .5)"/><path fill="#FE2C55" d="M11.4 1h3.5c.2 2.2 1.6 4 3.9 4.3v3.4c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.4-2.8 6.1-6.2 6.1S2.5 17.6 2.5 14.2s2.8-6.1 6.2-6.1c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V1z" transform="translate(.7 -.3)"/><path fill="#111" d="M11.4 1h3.5c.2 2.2 1.6 4 3.9 4.3v3.4c-1.4 0-2.7-.4-3.9-1.1v6.6c0 3.4-2.8 6.1-6.2 6.1S2.5 17.6 2.5 14.2s2.8-6.1 6.2-6.1c.3 0 .6 0 .9.1v3.5c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V1z"/></svg></span>
    <span class="soc soc-fb" title="Facebook"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M15.1 15.5l.5-3.5h-3.3V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.8 0-4.5 1.7-4.5 4.7V12H5.6v3.5h3v8.4a12 12 0 0 0 3.7 0v-8.4h2.8z"/></svg></span>
    <span class="soc soc-ig" title="Instagram"><svg viewBox="0 0 24 24"><defs><radialGradient id="igg" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#igg)"/><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.4" cy="7.6" r="1" fill="#fff"/></svg></span>`;

  function renderFooter() {
    const el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">${logoHTML('footer-logo')}</div>
            <nav class="footer-links">
              <a href="index.html">หน้าหลัก</a><a href="history.html">ประวัติ</a>
              <a href="profile.html">โปรไฟล์</a><a href="member.html">สมาชิก</a>
              <a href="team.html">ผู้จัดทำ</a>
            </nav>
            <div class="footer-contact">
              <h4>ช่องทางการติดต่อ</h4>
              <p>อีเมล : kinraidixxx@gmail.com</p>
              <p>เบอร์โทรศัพท์ : 012-345-6789</p>
              <div class="socials" aria-hidden="true">${SOCIAL_ICONS}</div>
            </div>
          </div>
          <p class="copyright">© Faculty of Information and Communication Technology, Silpakorn University. All Rights Reserved 2026</p>
          <p class="disclaimer">เว็บไซต์นี้จัดทำขึ้นเพื่อการศึกษาเท่านั้น ไม่ได้ใช้ในเชิงพาณิชย์ · ภาพร้านอาหารเป็นลิขสิทธิ์ของร้านและเจ้าของภาพ หากต้องการให้นำออก ติดต่อ kinraidixxx@gmail.com</p>
        </div>
      </footer>`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, type = '') {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + type; t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* ---------- Modal ----------
     openModal({ title, icon, body (html), theme: 'yellow'|'brown', wide, onMount(el, close) }) */
  function openModal({ title = '', iconName = '', body = '', theme = 'yellow', wide = false, onMount, onClose, noHead = false }) {
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    back.innerHTML = `
      <div class="modal ${theme === 'brown' ? 'brown' : ''} ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="ปิด">${icon('x')}</button>
        ${noHead ? '' : `<div class="modal-head"><h3>${iconName ? icon(iconName) : ''}${esc(title)}</h3></div>`}
        <div class="modal-body">${body}</div>
      </div>`;
    document.body.appendChild(back);
    document.body.style.overflow = 'hidden';
    const close = () => {
      back.remove();
      if (!document.querySelector('.modal-backdrop')) document.body.style.overflow = '';
      onClose && onClose();
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    back.querySelector('.modal-close').addEventListener('click', close);
    back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    onMount && onMount(back.querySelector('.modal'), close);
    return close;
  }

  function confirmModal({ title, message, okText = 'ตกลง', cancelText = 'ยกเลิก', danger = false, iconName = 'gear' }) {
    return new Promise((resolve) => {
      let done = false;
      openModal({
        title, iconName,
        body: `<p style="font-size:18px;text-align:center;margin:8px 0 20px">${esc(message)}</p>
               <div class="modal-actions" style="justify-content:center">
                 <button class="btn" data-no>${esc(cancelText)}</button>
                 <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(okText)}</button>
               </div>`,
        onMount(el, close) {
          el.querySelector('[data-no]').onclick = () => { done = true; resolve(false); close(); };
          el.querySelector('[data-yes]').onclick = () => { done = true; resolve(true); close(); };
        },
        onClose() { if (!done) resolve(false); },
      });
    });
  }

  /* ---------- Avatar ---------- */
  function avatarHTML(p, cls = '') {
    if (!p) return `<span class="avatar empty ${cls}">${icon('userCircle')}</span>`;
    if (p.avatar_url) return `<span class="avatar ${cls}"><img src="${esc(p.avatar_url)}" alt="${esc(p.display_name)}"></span>`;
    const ch = (p.display_name || p.email || '?').trim().charAt(0).toUpperCase();
    return `<span class="avatar ${cls}" style="background:${colorFor(p.id)}"><span class="initial">${esc(ch)}</span></span>`;
  }
  function colorFor(id = '') {
    const c = ['#FDE8B0', '#D7E8B8', '#F3D1DF', '#D8EAF6', '#F6DD78', '#E8D5C4'];
    let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return c[h % c.length];
  }
  function mbtiBadge(m) {
    if (!m) return '<span class="mbti">?</span>';
    m = m.toUpperCase();
    const g = m[1] === 'N' ? (m[2] === 'F' ? 'NF' : 'NT') : (m[3] === 'P' ? 'SP' : 'SJ');
    return `<span class="mbti ${g}">${esc(m)}</span>`;
  }

  /* ---------- รูปร้าน ---------- */
  function rImg(r, n = 1, cls = 'cover') {
    const idx = (r.id.length + n) % 4;
    return assetImg(`img/${r.id}-${n}.jpg`, { cls, alt: r.name, ph: idx, emoji: r.emoji || '🍽️' });
  }
  // โหลดรูปไม่ได้ → ลองที่สำรอง (Supabase) → ถ้ายังไม่ได้ แสดงพื้นสี + อีโมจิ / ข้อความแทน
  function imgFail(img) {
    if (img.dataset.alt) { const a = img.dataset.alt; img.removeAttribute('data-alt'); img.src = a; return; }
    const d = document.createElement(img.dataset.text ? 'span' : 'div');
    if (img.dataset.text) { d.className = 'logo-fallback'; d.textContent = img.dataset.text; }
    else if (img.dataset.emoji) { d.className = 'ph ph-' + img.dataset.ph; d.textContent = img.dataset.emoji; }
    else { img.remove(); return; }
    img.replaceWith(d);
  }

  function featIcons(r, max = 4) {
    const map = { aircon: ['snow', 'f-aircon', 'ห้องแอร์'], quiet: ['face', 'f-quiet', 'เงียบสงบ'], pet: ['paw', 'f-pet', 'สัตว์เลี้ยงเข้าได้'], wifi: ['wifi', 'f-wifi', 'Wi-Fi'], parking: ['car', 'f-parking', 'มีที่จอดรถ'], outdoor: ['sun', 'f-outdoor', 'กลางแจ้ง'], halal: ['leaf', 'f-halal', 'ฮาลาล'] };
    return `<span class="feat-icons">${r.feat.slice(0, max).map((f) => map[f] ? `<span title="${map[f][2]}">${icon(map[f][0], map[f][1])}</span>` : '').join('')}</span>`;
  }

  function restaurantCard(r, { fav = false } = {}) {
    return `
      <article class="r-card">
        <div class="thumb">
          <a href="restaurant.html?id=${r.id}">${rImg(r, 1)}</a>
          <button class="fav-btn ${fav ? 'on' : ''}" data-fav="${r.id}" aria-label="ร้านโปรด">${icon(fav ? 'heart' : 'heartOutline')}</button>
        </div>
        <div class="meta"><h3>${esc(r.name)}</h3>${featIcons(r, 3)}</div>
        <p>${esc(r.short)}</p>
        <a class="btn btn-yellow btn-sm" href="restaurant.html?id=${r.id}">อ่านต่อ</a>
      </article>`;
  }

  // ผูกปุ่มหัวใจทั้งหมดในหน้า
  function bindFavButtons(root = document) {
    root.querySelectorAll('[data-fav]').forEach((b) => {
      if (b.dataset.bound) return; b.dataset.bound = 1;
      b.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation();
        try {
          const on = await KRD.api.toggleFavorite(b.dataset.fav);
          document.querySelectorAll(`[data-fav="${b.dataset.fav}"]`).forEach((x) => {
            x.classList.toggle('on', on); x.innerHTML = icon(on ? 'heart' : 'heartOutline');
          });
          toast(on ? 'เพิ่มในร้านโปรดแล้ว 💛' : 'นำออกจากร้านโปรดแล้ว');
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  /* ---------- Dice overlay ---------- */
  function diceRoll(ms = 1400) {
    return new Promise((res) => {
      const o = document.createElement('div');
      o.className = 'dice-overlay';
      o.innerHTML = `<div class="dice-big">${diceSVG(160)}</div><p>กำลังสุ่มร้านที่ใช่...</p>`;
      document.body.appendChild(o);
      setTimeout(() => { o.remove(); res(); }, ms);
    });
  }

  /* ---------- Utilities ---------- */
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function getRestaurant(id) { return window.RESTAURANTS.find((r) => r.id === id); }
  function mapsLink(r) { return `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`; }
  function mapsEmbed(r) { return `https://maps.google.com/maps?q=${r.lat},${r.lng}&z=16&output=embed`; }
  function hoursText(r) {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const d = r.closed.length ? `หยุดทุกวัน${r.closed.map((x) => days[x]).join('และ')}` : 'ร้านเปิดให้บริการทุกวัน';
    return `${d}<br>เวลาเปิด-ปิด : ${r.open.replace(':', '.')} - ${r.close.replace(':', '.')} น.`;
  }

  // ป้องกันหน้าที่ต้องล็อกอิน
  async function requireLogin() {
    const me = await KRD.api.getMe();
    if (!me) { location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); throw new Error('redirect'); }
    return me;
  }

  // อ่านไฟล์รูปแล้วย่อขนาด (ลดขนาดก่อนอัปโหลด) → Blob
  function resizeImage(file, max = 800) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /* ---------- ช่องรหัสผ่าน + ปุ่มเปิด/ปิดตา (ใช้ทุกที่ที่กรอกรหัสผ่าน) ---------- */
  function pwField(name, placeholder, autocomplete = 'current-password') {
    return `<div class="field"><div class="pw-wrap">
        <input class="input" type="password" name="${name}" placeholder="${esc(placeholder)}" autocomplete="${autocomplete}">
        <button type="button" class="toggle-pw" aria-label="แสดงรหัสผ่าน">${icon('eye')}</button>
      </div></div>`;
  }
  function bindPwToggles(root = document) {
    root.querySelectorAll('.toggle-pw').forEach((b) => {
      if (b.dataset.bound) return; b.dataset.bound = 1;
      b.addEventListener('click', () => {
        const inp = b.parentElement.querySelector('input');
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        b.innerHTML = icon(show ? 'eyeOff' : 'eye');
        b.setAttribute('aria-label', show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
      });
    });
  }

  // เรียกตอนเริ่มทุกหน้า: วาด header/footer และคืนค่าผู้ใช้ปัจจุบัน
  async function boot(active, opts = {}) {
    let me = null;
    try { me = await KRD.api.getMe(); } catch (e) { console.warn(e); }
    renderHeader(active, Object.assign({ me }, opts));
    renderFooter();
    return me;
  }

  window.KRD = Object.assign(window.KRD || {}, {
    boot, pwField, bindPwToggles,
    icon, diceSVG, esc, logoHTML, renderHeader, renderFooter, toast, openModal, confirmModal,
    avatarHTML, mbtiBadge, rImg, imgFail, assetImg, featIcons, restaurantCard, bindFavButtons, diceRoll,
    qs, getRestaurant, mapsLink, mapsEmbed, hoursText, requireLogin, resizeImage,
  });
})();
