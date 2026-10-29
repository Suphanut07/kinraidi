/* =========================================================
   ระบบจับคู่ร้าน (Matching Engine)
   ---------------------------------------------------------
   1) คัดออก   : ร้านที่ไม่ผ่าน "เงื่อนไข" ที่คนนำเลือก (ติดแอร์, เปิดอยู่ตอนนี้, ใกล้ฉัน ฯลฯ)
   2) ให้คะแนน : ทุกคนในตี้ให้คะแนนร้าน 0-100 จาก
                 - MBTI ↔ บรรยากาศร้าน 4 มิติ        40 คะแนน
                 - ประเภทอาหารที่ชอบ                  20 คะแนน
                 - งบประมาณ                           15 คะแนน
                 - บรรยากาศที่ชอบ (แอร์/เงียบ/ฯลฯ)    15 คะแนน
                 - ทานร่วมกับ (คนเดียว/เพื่อน/...)     10 คะแนน
   3) ยุติธรรม : คะแนนกลุ่ม = 60% ค่าเฉลี่ย + 40% คะแนนของคนที่พอใจน้อยที่สุด
                 → ไม่มีใครในแก๊งต้องฝืนใจ
   4) สุ่ม     : สุ่มแบบถ่วงน้ำหนักจาก 3 อันดับแรก (ยังสนุกเหมือนทอยลูกเต๋า)
   ========================================================= */
(function () {
  const cfg = window.KRD_CONFIG || {};

  // ค่าในอุดมคติของแต่ละขั้ว MBTI บนสเกลบรรยากาศร้าน (-2..2)
  const IDEAL = { E: 1.5, I: -1.5, N: 1.5, S: -1, F: 1.5, T: -1, P: 1.5, J: -1 };
  const AXES = [['e', 0], ['n', 1], ['f', 2], ['p', 3]];

  function mbtiFit(mbti, r) {
    if (!mbti || mbti.length !== 4) return 0.6; // ไม่รู้ MBTI → กลางๆ
    let s = 0;
    for (const [k, i] of AXES) s += 1 - Math.min(1, Math.abs(IDEAL[mbti[i]] - r.vibe[k]) / 3.5);
    return s / 4;
  }

  function personScore(p, r, partyType) {
    const pr = p.prefs || {};
    let score = 40 * mbtiFit(p.mbti, r);
    // ประเภทอาหาร
    if (!pr.food || !pr.food.length) score += 12;
    else score += r.cats.some((c) => pr.food.includes(c)) ? 20 : 4;
    // งบ
    if (!pr.budget || !pr.budget.length) score += 10;
    else if (pr.budget.map(Number).includes(r.price)) score += 15;
    else if (pr.budget.map(Number).some((b) => Math.abs(b - r.price) === 1)) score += 7;
    // บรรยากาศ
    if (!pr.vibe || !pr.vibe.length) score += 10;
    else score += 15 * (pr.vibe.filter((v) => r.feat.includes(v)).length / pr.vibe.length);
    // ทานร่วมกับ
    if (!pr.with || !pr.with.length) score += 7;
    else score += (pr.with.includes(partyType) && r.goodFor.includes(partyType)) ? 10 : (r.goodFor.includes(partyType) ? 7 : 3);
    return Math.max(0, Math.min(100, score));
  }

  function minutes(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
  function isOpenNow(r, now = new Date()) {
    if (r.closed.includes(now.getDay())) return false;
    const t = now.getHours() * 60 + now.getMinutes();
    const o = minutes(r.open), c = minutes(r.close);
    return c > o ? t >= o && t < c : t >= o || t < c;
  }
  function distanceKm(a, b) {
    const R = 6371, rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function passes(r, conds, ctx) {
    const cats = conds.filter((k) => (window.CONDITIONS.find((c) => c.key === k) || {}).type === 'cat');
    const feats = conds.filter((k) => (window.CONDITIONS.find((c) => c.key === k) || {}).type === 'feat');
    if (cats.length && !r.cats.some((c) => cats.includes(c))) return false;
    if (feats.some((f) => !r.feat.includes(f))) return false;
    if (conds.includes('opennow') && !isOpenNow(r)) return false;
    if (conds.includes('near') && distanceKm(ctx.location || cfg.CAMPUS, r) > (cfg.NEAR_KM || 3)) return false;
    if (ctx.search) {
      const q = ctx.search.toLowerCase();
      const hay = [r.name, r.nameEn, r.short, r.desc, ...r.cats.map((c) => window.LABELS.cats[c])].join(' ').toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  /**
   * แนะนำร้าน
   * @param party  รายชื่อคนในตี้ (profile) — รวมตัวเองด้วย
   * @param conds  key ของเงื่อนไขที่เลือก
   * @param opts   { exclude: [ids], search, location }
   * @returns { pick, ranked, relaxed, reasons, percent }
   */
  function recommend(party, conds = [], opts = {}) {
    const exclude = opts.exclude || [];
    const partyType = party.length <= 1 ? 'solo' : 'friends';
    let pool = window.RESTAURANTS.filter((r) => !exclude.includes(r.id));
    let filtered = pool.filter((r) => passes(r, conds, opts));
    let relaxed = false;
    if (!filtered.length) {
      // ไม่มีร้านผ่านทุกเงื่อนไข → ผ่อนเงื่อนไข: เลือกร้านที่ผ่านเงื่อนไขได้มากที่สุด
      relaxed = true;
      const scored = pool.map((r) => ({ r, ok: conds.filter((c) => passes(r, [c], opts)).length }));
      const best = Math.max(0, ...scored.map((s) => s.ok));
      filtered = scored.filter((s) => s.ok === best).map((s) => s.r);
    }
    if (!filtered.length) return null;

    const ranked = filtered.map((r) => {
      const scores = party.map((p) => personScore(p, r, partyType));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const min = Math.min(...scores);
      const group = 0.6 * avg + 0.4 * min;
      return { r, scores, avg, min, group };
    }).sort((a, b) => b.group - a.group);

    // สุ่มถ่วงน้ำหนักจาก 3 อันดับแรก
    const top = ranked.slice(0, 3);
    const weights = top.map((t, i) => Math.max(1, t.group) * [1.6, 1.15, 1][i]);
    let x = Math.random() * weights.reduce((a, b) => a + b, 0);
    let chosen = top[0];
    for (let i = 0; i < top.length; i++) { x -= weights[i]; if (x <= 0) { chosen = top[i]; break; } }

    const percent = Math.round(Math.max(55, Math.min(99, 35 + chosen.group * 0.68)));
    return {
      pick: chosen.r, ranked, relaxed, percent,
      reasons: buildReasons(chosen, party, conds, opts, relaxed),
    };
  }

  /* ---------- เหตุผลภาษาคน ---------- */
  function buildReasons(entry, party, conds, opts, relaxed) {
    const r = entry.r, out = [];
    const L = window.LABELS;
    const condLabels = conds.map((k) => (window.CONDITIONS.find((c) => c.key === k) || {}).label).filter(Boolean);
    if (condLabels.length && !relaxed) out.push(`ตรงทุกเงื่อนไขที่ขอ: ${condLabels.join(', ')}`);
    if (relaxed && condLabels.length) out.push('ยังไม่มีร้านที่ตรงทุกเงื่อนไข เลยเลือกร้านที่ใกล้เคียงที่สุดให้แทน');

    // MBTI: ดูขั้ว E/I ของแก๊ง
    const known = party.filter((p) => p.mbti && p.mbti.length === 4);
    const I = known.filter((p) => p.mbti[0] === 'I').length;
    const E = known.filter((p) => p.mbti[0] === 'E').length;
    if (I > E && r.vibe.e <= 0) out.push(`บรรยากาศไม่วุ่นวาย เหมาะกับสาย I ${I} คนในตี้`);
    else if (E > I && r.vibe.e >= 1) out.push(`ร้านคึกคัก คุยกันได้เต็มที่ ถูกใจสาย E ${E} คนในตี้`);
    else if (known.length && E === I) out.push('บรรยากาศกำลังดี ทั้งสาย I และสาย E นั่งสบาย');
    const F = known.filter((p) => p.mbti[2] === 'F').length;
    if (F > known.length / 2 && r.vibe.f >= 1) out.push('ร้านสวย บรรยากาศดี ถ่ายรูปลงสตอรี่ได้');
    const T = known.filter((p) => p.mbti[2] === 'T').length;
    if (T > known.length / 2 && r.vibe.f <= 0) out.push('คุ้มค่า ได้อาหารไว ไม่ต้องรอนาน');

    // ประเภทอาหาร
    const lovers = party.filter((p) => (p.prefs.food || []).some((c) => r.cats.includes(c)));
    if (lovers.length) {
      const cat = r.cats.find((c) => lovers.some((p) => p.prefs.food.includes(c)));
      out.push(`ตรงกับสาย${L.cats[cat]}ของ ${names(lovers)}`);
    }
    // งบ
    const inBudget = party.filter((p) => (p.prefs.budget || []).map(Number).includes(r.price));
    if (inBudget.length === party.length && party.length) out.push(`อยู่ในงบของทุกคน (${L.price[r.price]})`);
    else if (inBudget.length) out.push(`อยู่ในงบของ ${names(inBudget)}`);
    // บรรยากาศที่ชอบ
    const vibeHit = [...new Set(party.flatMap((p) => (p.prefs.vibe || []).filter((v) => r.feat.includes(v))))];
    if (vibeHit.length) out.push(`มี${vibeHit.map((v) => L.feat[v]).join(' และ ')}อย่างที่ชอบ`);

    // คนที่พอใจน้อยสุด
    if (party.length > 1) {
      const minScore = Math.round(entry.min);
      if (minScore >= 60) out.push('ทุกคนในแก๊งพอใจร้านนี้ ไม่มีใครต้องฝืนใจ');
    }
    return [...new Set(out)].slice(0, 5);
  }
  function names(list) {
    const n = list.map((p) => p.display_name);
    return n.length > 3 ? `${n.slice(0, 3).join(', ')} และอีก ${n.length - 3} คน` : n.join(', ');
  }

  /* ---------- สรุปบุคลิกแก๊ง ---------- */
  function gangSummary(party) {
    const known = party.filter((p) => p.mbti && p.mbti.length === 4);
    if (!known.length) return null;
    const cnt = (i, ch) => known.filter((p) => p.mbti[i] === ch).length;
    const E = cnt(0, 'E'), I = cnt(0, 'I'), N = cnt(1, 'N'), S = cnt(1, 'S');
    const F = cnt(2, 'F'), T = cnt(2, 'T'), J = cnt(3, 'J'), P = cnt(3, 'P');
    const parts = [];
    parts.push(I > E ? 'สายชิล คุยเบาๆ' : E > I ? 'สายเฮฮา คุยเสียงดังได้' : 'ชิลก็ได้ เฮก็ดี');
    parts.push(N > S ? 'ชอบลองของใหม่' : S > N ? 'ชอบเมนูคุ้นเคย' : 'ลองใหม่ได้บ้าง');
    parts.push(F > T ? 'ให้ความสำคัญกับบรรยากาศ' : T > F ? 'เน้นคุ้มค่า อิ่มไว' : 'บรรยากาศดีและคุ้ม');
    parts.push(P > J ? 'ไปแบบจรๆ' : J > P ? 'ชอบวางแผน' : '');
    const counts = [I && `I ${I}`, E && `E ${E}`].filter(Boolean).join(', ');
    return { counts, text: parts.filter(Boolean).join(' · '), unknown: party.length - known.length };
  }

  window.KRD = window.KRD || {};
  window.KRD.match = { recommend, gangSummary, isOpenNow, distanceKm, personScore };
})();
