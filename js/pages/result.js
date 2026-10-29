/* =========================================================
   หน้าผลลัพธ์ "นี่คือร้านอาหารของคุณ !!"
   - ปุ่มลูกเต๋าซ้ายบน = สุ่มใหม่ (ตัดร้านนี้ออก)
   - บนมือถือ: "สุ่มเลย !" ในเมนู ☰ = สุ่มใหม่
   ========================================================= */
(async function () {
  const { icon, esc, diceSVG, avatarHTML, toast } = KRD;
  let state;
  try { state = JSON.parse(sessionStorage.getItem('krd_roll')); } catch {}

  const me = await KRD.boot('home', { onMobileReroll: () => reroll() });
  if (!me) { location.replace('login.html'); return; }
  if (!state || !state.current) { location.replace('index.html'); return; }

  let favIds = [];
  try { favIds = (await KRD.api.listFavorites()).map((f) => f.restaurant_id); } catch {}

  function party() { return [me, ...(state.party || [])]; }

  function render() {
    const r = KRD.getRestaurant(state.current.id);
    if (!r) { location.replace('index.html'); return; }
    const gang = KRD.match.gangSummary(party());
    const p = party();
    document.getElementById('page').innerHTML = `
      <div class="container">
        <section class="result-head">
          <button class="dice-btn" id="reroll" title="สุ่มใหม่ (ไม่เอาร้านนี้)"><span class="inner"><span class="dice-svg">${diceSVG(96)}</span><span class="label">สุ่มเลย !</span></span></button>
          <div>
            <h1>นี่คือร้านอาหารของคุณ !!</h1>
            <div class="why-box">
              <div class="match-ring" style="--p:${state.current.percent}"><div><b>${state.current.percent}%</b><small>แมตช์</small></div></div>
              <div>
                <h3>ทำไมถึงเป็นร้านนี้ ?</h3>
                <ul>${state.current.reasons.map((x) => `<li>${icon('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
                ${gang ? `<div class="gang"><b>${state.groupName ? esc(state.groupName) : (p.length > 1 ? 'แก๊งนี้' : 'คุณ')}</b>
                   ${gang.counts ? `<span>(${gang.counts}${gang.unknown ? `, ไม่ระบุ MBTI ${gang.unknown}` : ''})</span>` : ''} → <span>${esc(gang.text)}</span></div>` : ''}
                <div class="party-strip">${p.map((x) => `<span title="${esc(x.display_name)} ${x.mbti || ''}">${avatarHTML(x)}</span>`).join('')}</div>
              </div>
            </div>
            <div class="reroll-mobile"><button class="btn btn-primary" id="reroll-m">${icon('star')} สุ่มใหม่</button></div>
          </div>
        </section>
        ${KRD.detail.detailHTML(r, { fav: favIds.includes(r.id) })}
      </div>`;
    KRD.detail.bindGallery(document.getElementById('page'), r);
    document.getElementById('reroll').addEventListener('click', reroll);
    document.getElementById('reroll-m').addEventListener('click', reroll);
  }

  async function reroll() {
    state.exclude = [...new Set([...(state.exclude || []), state.current.id])];
    let res = KRD.match.recommend(party(), state.conds || [], { exclude: state.exclude, search: state.search, location: state.location });
    if (!res) {
      // สุ่มครบทุกร้านแล้ว → เริ่มรอบใหม่ (แต่ไม่ให้ซ้ำร้านล่าสุด)
      state.exclude = [state.current.id];
      res = KRD.match.recommend(party(), state.conds || [], { exclude: state.exclude, search: state.search, location: state.location });
      toast('วนครบทุกร้านที่เข้าเงื่อนไขแล้ว เริ่มสุ่มรอบใหม่นะ');
    }
    if (!res) { toast('ไม่มีร้านอื่นที่เข้าเงื่อนไขแล้ว', 'error'); return; }
    state.current = { id: res.pick.id, percent: res.percent, reasons: res.reasons, relaxed: res.relaxed };
    sessionStorage.setItem('krd_roll', JSON.stringify(state));
    try { await KRD.api.addHistory(res.pick.id, party().map((x) => ({ id: x.id, name: x.display_name }))); } catch {}
    await KRD.diceRoll(1100);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render();
})();
