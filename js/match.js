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
    const feats = conds.filter((k) => (window.CONDITIONS.find((c) => c.key === k) || {}).type === 'feat');
    if (feats.some((f) => !r.feat.includes(f))) return false;
    if (conds.includes('opennow') && !isOpenNow(r)) return false;
    if (conds.includes('near') && distanceKm(ctx.location || cfg.CAMPUS, r) > (cfg.NEAR_KM || 3)) return false;
    if (conds.includes('cheap') && r.price > 1) return false;
    return true;
  }

  /* =========================================================
     กล่อง "รายละเอียดเพิ่มเติม" — ระบบจับคำสำคัญภาษาไทย
     - เจอคำ → เพิ่มคะแนนร้านที่ตรง (ไม่ได้คัดร้านทิ้ง จึงยังสุ่มได้เสมอ)
     - มีคำปฏิเสธนำหน้า (ไม่เอา / ไม่กิน / ไม่อยาก / งด ...) → ลดคะแนนร้านที่ตรงแทน
     key ที่ใช้: แท็กใน RESTAURANT_TAGS, ประเภทอาหาร (cats), หรือฟีเจอร์ร้าน (feat)
     อยากเพิ่มคำ → เพิ่มแถวใน KEYWORDS ได้เลย
     ========================================================= */
  const KEYWORDS = [
    { re: /ซด|น้ำซุป|ซุป|ร้อนๆ|ร้อน ๆ|ต้ม|หม่าล่า|ชาบู|สุกี้/, keys: ['soup'], label: 'ซุปร้อนๆ' },
    { re: /ก๋วยเตี๋ยว|เส้น|บะหมี่|ราเมง|ราเมน|พาสต้า/, keys: ['noodle'], label: 'เมนูเส้น' },
    { re: /เผ็ด|แซ่บ|แซบ|ยำ|ส้มตำ|ตำ|ลาบ/, keys: ['spicy'], label: 'รสจัดจ้าน' },
    { re: /ทอด|กรอบ|คาราเกะ|ทงคัตสึ/, keys: ['fried'], label: 'ของทอด' },
    { re: /ของหวาน|หวาน|ไอติม|ไอศกรีม|เค้ก|ขนม|บิงซู|ปังเย็น|บัวลอย|เบเกอรี/, keys: ['sweet', 'dessert', 'bakery'], label: 'ของหวาน' },
    { re: /กาแฟ|คาเฟ่|ชาไทย|ชานม|มัทฉะ|เครื่องดื่ม|สมูทตี้/, keys: ['coffee', 'cafe'], label: 'คาเฟ่/เครื่องดื่ม' },
    { re: /ข้าว(?!โพด)|กับข้าว|จานเดียว/, keys: ['rice'], label: 'ข้าว' },
    { re: /หมู|เนื้อ|ไก่|เป็ด|สเต๊ก/, keys: ['meat'], label: 'เนื้อสัตว์' },
    { re: /ทะเล|ซีฟู้ด|กุ้ง|ปลา(?!ย)|แซลมอน|หมึก|ปูผัด|เนื้อปู/, keys: ['seafood'], label: 'อาหารทะเล' },
    { re: /ญี่ปุ่น|ซูชิ|ซาชิมิ|ดงบุริ|แกงกะหรี่|ราเมง|ราเมน/, keys: ['japanese'], label: 'อาหารญี่ปุ่น' },
    { re: /เกาหลี|ต็อกบกกี|กิมจิ/, keys: ['korean'], label: 'อาหารเกาหลี' },
    { re: /ฝรั่ง|พิซซ่า|สเต๊ก|พาสต้า|เบอร์เกอร์/, keys: ['western'], label: 'อาหารฝรั่ง' },
    { re: /อีสาน|ส้มตำ|ลาบ|น้ำตก/, keys: ['isan'], label: 'อาหารอีสาน' },
    { re: /อาหารไทย|ตามสั่ง|กะเพรา|ผัดไทย/, keys: ['thai', 'madetoorder'], label: 'อาหารไทย' },
    { re: /บรันช์|อาหารเช้า|มื้อสาย/, keys: ['brunch'], label: 'บรันช์' },
    { re: /เงียบ|สงบ|คุยงาน|ทำงาน|อ่านหนังสือ|ทำการบ้าน/, keys: ['quiet'], label: 'บรรยากาศเงียบ' },
    { re: /ถ่ายรูป|สวย|มินิมอล|น่ารัก|ลงสตอรี่|ไอจี/, keys: ['photo'], label: 'ร้านสวยถ่ายรูป' },
    { re: /นั่งนาน|นั่งยาว|นั่งชิล|ชิล/, keys: ['chill'], label: 'นั่งชิลได้นาน' },
    { re: /เฮฮา|ปาร์ตี้|สังสรรค์|เสียงดัง|แก๊งใหญ่|คนเยอะ/, keys: ['group'], label: 'เฮฮากับแก๊ง' },
    { re: /รีบ|ด่วน|เร็ว|ไม่มีเวลา|คาบต่อไป/, keys: ['fast'], label: 'ได้อาหารไว' },
    { re: /คลีน|สุขภาพ|ผัก|ไม่อ้วน|ไดเอท/, keys: ['healthy'], label: 'อาหารสุขภาพ' },
    { re: /แอร์|เย็นๆ|ร้อนมาก|อากาศร้อน/, keys: ['aircon'], label: 'ห้องแอร์' },
    { re: /กลางแจ้ง|ลมเย็น|ในสวน|ธรรมชาติ/, keys: ['outdoor'], label: 'นั่งกลางแจ้ง' },
    { re: /หมา|แมว|สัตว์เลี้ยง/, keys: ['pet'], label: 'พาสัตว์เลี้ยงได้' },
    { re: /ราคาถูก|ถูกๆ|ถูก ๆ|ประหยัด|ปลายเดือน|ไม่แพง|งบน้อย/, keys: ['$cheap'], label: 'ราคาประหยัด' },
  ];
  const NEG = /(ไม่เอา|ไม่กิน|ไม่อยาก|ไม่ชอบ|ไม่ต้องการ|ไม่|งด|เลี่ยง|ห้าม)\s*(กิน|ของ|อาหาร|ร้าน|พวก|อะไร|ที่|แบบ|รส)?\s*$/;

  function parseNote(text) {
    const out = { pos: [], neg: [], names: [] };
    if (!text || !text.trim()) return out;
    const t = text.toLowerCase();
    for (const k of KEYWORDS) {
      const re = new RegExp(k.re.source, 'g');
      let m, isPos = false, isNeg = false;
      while ((m = re.exec(t))) {
        const before = t.slice(Math.max(0, m.index - 12), m.index);
        if (NEG.test(before)) isNeg = true; else isPos = true;
      }
      if (isNeg) out.neg.push(k); else if (isPos) out.pos.push(k);
    }
    // พิมพ์ชื่อร้านมาตรงๆ
    for (const r of window.RESTAURANTS) {
      for (const n of [r.name, r.nameEn].filter(Boolean)) {
        const i = t.indexOf(n.toLowerCase());
        if (i >= 0) { out.names.push({ id: r.id, neg: NEG.test(t.slice(Math.max(0, i - 12), i)), label: r.name }); break; }
      }
    }
    return out;
  }
  function hasKey(r, key) {
    if (key === '$cheap') return r.price <= 1;
    const tags = (window.RESTAURANT_TAGS || {})[r.id] || [];
    return tags.includes(key) || r.cats.includes(key) || r.feat.includes(key);
  }
  // คืนค่า { bonus, hits: [label], avoided: [label], violated: [label] }
  function noteScore(r, note) {
    const res = { bonus: 0, hits: [], avoided: [], violated: [] };
    for (const k of note.pos) if (k.keys.some((key) => hasKey(r, key))) { res.bonus += 24; res.hits.push(k.label); }
    for (const k of note.neg) {
      if (k.keys.some((key) => hasKey(r, key))) { res.bonus -= 35; res.violated.push(k.label); }
      else res.avoided.push(k.label);
    }
    for (const n of note.names) if (n.id === r.id) { res.bonus += n.neg ? -80 : 60; if (!n.neg) res.hits.push('ร้าน' + n.label); }
    res.bonus = Math.max(-80, Math.min(60, res.bonus));
    return res;
  }

  /**
   * แนะนำร้าน
   * @param party  รายชื่อคนในตี้ (profile) — รวมตัวเองด้วย
   * @param conds  key ของเงื่อนไขที่เลือก
   * @param opts   { exclude: [ids], note (ข้อความในกล่องรายละเอียด), location }
   * @returns { pick, ranked, relaxed, reasons, percent }
   */
  function recommend(party, conds = [], opts = {}) {
    const note = parseNote(opts.note || opts.search || '');
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
      const ns = noteScore(r, note);
      const group = Math.max(1, 0.6 * avg + 0.4 * min + ns.bonus);
      return { r, scores, avg, min, group, ns };
    }).sort((a, b) => b.group - a.group);

    // ถ้ามีร้านที่ตรงกับ "รายละเอียดเพิ่มเติม" → สุ่มจากกลุ่มนั้นก่อน และเลี่ยงร้านที่มีของที่บอกว่าไม่เอา
    let base = ranked;
    const clean = base.filter((x) => !x.ns.violated.length);
    if (clean.length) base = clean;
    const withHits = base.filter((x) => x.ns.hits.length);
    if (withHits.length) base = withHits;
    // สุ่มถ่วงน้ำหนักจาก 3 อันดับแรก
    const top = base.slice(0, 3);
    const weights = top.map((t, i) => Math.max(1, t.group) * [1.6, 1.15, 1][i]);
    let x = Math.random() * weights.reduce((a, b) => a + b, 0);
    let chosen = top[0];
    for (let i = 0; i < top.length; i++) { x -= weights[i]; if (x <= 0) { chosen = top[i]; break; } }

    const percent = Math.round(Math.max(55, Math.min(99, 35 + Math.min(100, chosen.group) * 0.64)));
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
    // กล่องรายละเอียดเพิ่มเติม
    if (entry.ns) {
      if (entry.ns.hits.length) out.push(`ตรงกับที่ขอ: ${[...new Set(entry.ns.hits)].join(', ')}`);
      if (entry.ns.avoided.length) out.push(`ไม่มี${[...new Set(entry.ns.avoided)].join(' / ')} ตามที่บอกว่าไม่เอา`);
    }

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
    return [...new Set(out)].slice(0, 6);
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
  window.KRD.match = { recommend, gangSummary, isOpenNow, distanceKm, personScore, parseNote, noteScore };
})();
