/* =========================================================
   Data layer — หน้าเว็บทุกหน้าเรียกผ่าน KRD.api เท่านั้น
   มี 2 โหมด (หน้าตาฟังก์ชันเหมือนกันทุกอย่าง):
   1) Supabase  — เมื่อใส่ค่าใน js/config.js (ใช้งานจริงข้ามเครื่อง)
   2) Demo      — เก็บใน localStorage ของเบราว์เซอร์ (ไว้ทดสอบ/พรีเซนต์ออฟไลน์)
   ========================================================= */
(function () {
  const cfg = window.KRD_CONFIG || {};
  const useSupabase = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);

  const emptyPrefs = () => ({ food: [], with: [], budget: [], vibe: [] });
  const defaultNotif = () => ({ push: true, email: false, news: true });
  const randCode = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + Math.random().toString(16).slice(2));
  const fail = (msg) => { throw new Error(msg); };

  function normProfile(p) {
    if (!p) return null;
    return {
      id: p.id, email: p.email, display_name: p.display_name || (p.email || '').split('@')[0],
      bio: p.bio || '', mbti: p.mbti || '', avatar_url: p.avatar_url || '',
      prefs: Object.assign(emptyPrefs(), p.prefs || {}),
      notif: Object.assign(defaultNotif(), p.notif || {}),
      friend_code: p.friend_code || '', name_changed_at: p.name_changed_at || null,
    };
  }

  /* =======================================================
     DEMO BACKEND (localStorage)
     ======================================================= */
  function DemoBackend() {
    const KEY = 'krd_demo_v1', SKEY = 'krd_demo_session';
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
    const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
    let db = load();
    if (!db) { db = seed(); save(db); }
    const me = () => { const id = localStorage.getItem(SKEY); return id && db.users[id] ? id : null; };
    const pub = (u) => { if (!u) return null; const { password, ...rest } = u; return normProfile(rest); };
    const need = () => me() || fail('กรุณาเข้าสู่ระบบก่อน');
    const reload = () => { db = load() || db; };

    function seed() {
      const mk = (name, email, mbti, prefs, bio = '') => ({
        id: uid(), email, password: '123456', display_name: name, mbti, bio, avatar_url: '',
        prefs: Object.assign(emptyPrefs(), prefs), notif: defaultNotif(), friend_code: randCode(), name_changed_at: null,
      });
      const U = [
        mk('ปอยจังชอบกินแซลม่อน', 'poy@demo.com', 'ISFJ', { food: ['japanese', 'dessert'], with: ['solo', 'friends'], budget: [2], vibe: ['aircon', 'quiet'] }, 'วันไหนมีแซลมอน วันนั้นคือวันที่ดี 🍣✨ หายใจเข้าเป็นซาชิมิ หายใจออกเป็นความอร่อย 🧡'),
        mk('มันนี่', 'money@demo.com', 'INFJ', { food: ['cafe', 'dessert'], with: ['friends'], budget: [2], vibe: ['quiet'] }),
        mk('แทนแทน', 'tan@demo.com', 'ENTJ', { food: ['thai', 'japanese'], with: ['friends'], budget: [2, 3], vibe: ['aircon'] }),
        mk('เก้า', 'kao@demo.com', 'ISFP', { food: ['cafe'], with: ['couple'], budget: [1, 2], vibe: ['outdoor', 'pet'] }),
        mk('รีเจนซี่', 'regency@demo.com', 'ESFJ', { food: ['thai'], with: ['family'], budget: [2], vibe: ['aircon'] }),
        mk('แก้ม', 'gam@demo.com', 'ESFP', { food: ['dessert', 'thai'], with: ['friends'], budget: [1, 2], vibe: ['outdoor'] }),
        mk('ตะโก้', 'tako@demo.com', 'ENFJ', { food: ['japanese'], with: ['friends'], budget: [2], vibe: ['aircon'] }),
        mk('พริบ', 'prib@demo.com', 'ENTJ', { food: ['thai'], with: ['friends'], budget: [1], vibe: [] }),
      ];
      const users = {}; U.forEach((u) => (users[u.id] = u));
      const [poy, ...others] = U;
      const friendships = others.map((o) => [poy.id, o.id]);
      const groups = [
        { id: uid(), name: 'อ้ายมา 4 คน', photo_url: '', created_by: poy.id, member_ids: [poy.id, U[2].id, U[3].id, U[7].id] },
        { id: uid(), name: 'แก๊งสาวสวย', photo_url: '', created_by: poy.id, member_ids: [poy.id, U[1].id, U[5].id, U[4].id] },
        { id: uid(), name: 'ตี้หมูกะทะ', photo_url: '', created_by: poy.id, member_ids: [poy.id, U[2].id, U[5].id, U[6].id, U[1].id] },
      ];
      return { users, friendships, groups, favorites: {}, history: {}, mealJoins: [] };
    }

    const api = {
      mode: 'demo',
      async getMe() { reload(); const id = me(); return id ? pub(db.users[id]) : null; },
      async signUp(email, password) {
        reload(); email = email.trim().toLowerCase();
        if (Object.values(db.users).some((u) => u.email === email)) fail('อีเมลนี้ถูกใช้สมัครแล้ว');
        const u = { id: uid(), email, password, display_name: email.split('@')[0], mbti: '', bio: '', avatar_url: '', prefs: emptyPrefs(), notif: defaultNotif(), friend_code: randCode(), name_changed_at: null };
        db.users[u.id] = u; save(db); localStorage.setItem(SKEY, u.id); return pub(u);
      },
      async signIn(email, password) {
        reload(); email = email.trim().toLowerCase();
        const u = Object.values(db.users).find((x) => x.email === email && x.password === password);
        if (!u) fail('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        localStorage.setItem(SKEY, u.id); return pub(u);
      },
      async signOut() { localStorage.removeItem(SKEY); },
      async verifyCredentials(email, password) {
        reload(); email = email.trim().toLowerCase();
        const u = Object.values(db.users).find((x) => x.email === email && x.password === password);
        if (!u) fail('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        return pub(u);
      },
      async changePassword(oldPw, newPw) {
        reload(); const u = db.users[need()];
        if (u.password !== oldPw) fail('รหัสผ่านเดิมไม่ถูกต้อง');
        u.password = newPw; save(db);
      },
      async updateMe(patch) {
        reload(); const u = db.users[need()];
        Object.assign(u, patch); save(db); return pub(u);
      },
      async uploadImage(blob) {
        return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      },
      async getProfiles(ids) { reload(); return ids.map((i) => pub(db.users[i])).filter(Boolean); },
      async findUser(q) {
        reload(); q = q.trim();
        const u = Object.values(db.users).find((x) => x.friend_code === q.toUpperCase() || x.email === q.toLowerCase());
        return pub(u);
      },
      async listFriends() {
        reload(); const id = need();
        const ids = db.friendships.filter((f) => f.includes(id)).map((f) => (f[0] === id ? f[1] : f[0]));
        return ids.map((i) => pub(db.users[i])).filter(Boolean);
      },
      async addFriend(otherId) {
        reload(); const id = need();
        if (otherId === id) fail('เพิ่มตัวเองเป็นเพื่อนไม่ได้นะ 😆');
        if (!db.users[otherId]) fail('ไม่พบผู้ใช้นี้');
        if (!db.friendships.some((f) => f.includes(id) && f.includes(otherId))) { db.friendships.push([id, otherId]); save(db); }
        return pub(db.users[otherId]);
      },
      async listGroups() {
        reload(); const id = need();
        return db.groups.filter((g) => g.member_ids.includes(id)).map((g) => ({
          id: g.id, name: g.name, photo_url: g.photo_url, created_by: g.created_by,
          members: g.member_ids.map((m) => pub(db.users[m])).filter(Boolean),
        }));
      },
      async createGroup({ name, photo_url = '', member_ids = [] }) {
        reload(); const id = need();
        const g = { id: uid(), name, photo_url, created_by: id, member_ids: [...new Set([id, ...member_ids])] };
        db.groups.push(g); save(db); return g.id;
      },
      async updateGroup(gid, patch) {
        reload(); const g = db.groups.find((x) => x.id === gid) || fail('ไม่พบกลุ่ม');
        Object.assign(g, patch); save(db);
      },
      async addGroupMembers(gid, ids) {
        reload(); const g = db.groups.find((x) => x.id === gid) || fail('ไม่พบกลุ่ม');
        g.member_ids = [...new Set([...g.member_ids, ...ids])]; save(db);
      },
      async removeGroupMember(gid, userId) {
        reload(); const g = db.groups.find((x) => x.id === gid) || fail('ไม่พบกลุ่ม');
        g.member_ids = g.member_ids.filter((m) => m !== userId);
        if (!g.member_ids.length) db.groups = db.groups.filter((x) => x.id !== gid);
        save(db);
      },
      async deleteGroup(gid) { reload(); db.groups = db.groups.filter((x) => x.id !== gid); save(db); },
      async listFavorites() { reload(); const id = need(); return (db.favorites[id] || []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at)); },
      async toggleFavorite(rid) {
        reload(); const id = need();
        const list = db.favorites[id] || (db.favorites[id] = []);
        const i = list.findIndex((f) => f.restaurant_id === rid);
        if (i >= 0) list.splice(i, 1); else list.push({ restaurant_id: rid, created_at: new Date().toISOString() });
        save(db); return i < 0;
      },
      async listHistory() { reload(); const id = need(); return (db.history[id] || []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at)); },
      async addHistory(rid, party = []) {
        reload(); const id = need();
        const list = db.history[id] || (db.history[id] = []);
        list.push({ id: uid(), restaurant_id: rid, party, created_at: new Date().toISOString() });
        if (list.length > 100) list.shift();
        save(db);
      },
      async joinMeal(hostId) {
        reload(); const id = need();
        db.mealJoins.push({ host_id: hostId, user_id: id, created_at: new Date().toISOString() });
        db.mealJoins = db.mealJoins.slice(-200); save(db);
      },
      async getMealJoins(hostId, since) {
        reload();
        const ids = [...new Set(db.mealJoins.filter((j) => j.host_id === hostId && j.created_at > since).map((j) => j.user_id))];
        return ids.map((i) => pub(db.users[i])).filter(Boolean);
      },
      resetDemo() { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); },
    };
    return api;
  }

  /* =======================================================
     SUPABASE BACKEND
     ======================================================= */
  function SupabaseBackend() {
    const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    let cachedMe = null;
    const chk = ({ data, error }) => { if (error) throw new Error(thaiError(error.message)); return data; };
    async function authId() {
      const { data } = await sb.auth.getSession();
      return data.session ? data.session.user.id : null;
    }
    async function need() { return (await authId()) || fail('กรุณาเข้าสู่ระบบก่อน'); }

    const api = {
      mode: 'supabase', client: sb,
      async getMe(force = false) {
        const id = await authId();
        if (!id) { cachedMe = null; return null; }
        if (cachedMe && cachedMe.id === id && !force) return cachedMe;
        const p = chk(await sb.from('profiles').select('*').eq('id', id).maybeSingle());
        cachedMe = normProfile(p); return cachedMe;
      },
      async signUp(email, password) {
        const data = chk(await sb.auth.signUp({ email: email.trim().toLowerCase(), password }));
        if (!data.session) fail('สมัครสำเร็จ แต่ระบบยังเปิด "ยืนยันอีเมล" อยู่ — ให้ปิดใน Supabase > Authentication > Providers > Email');
        return api.getMe(true);
      },
      async signIn(email, password) {
        chk(await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }));
        return api.getMe(true);
      },
      async signOut() { await sb.auth.signOut(); cachedMe = null; },
      // ใช้ client แยก (ไม่บันทึก session) เพื่อให้เพื่อนล็อกอินบนเครื่องเราได้โดยไม่เด้งเราออก
      async verifyCredentials(email, password) {
        const tmp = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'krd-tmp' } });
        const { data, error } = await tmp.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) fail('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        const p = (await tmp.from('profiles').select('*').eq('id', data.user.id).maybeSingle()).data;
        await tmp.auth.signOut();
        return normProfile(p);
      },
      async changePassword(oldPw, newPw) {
        const me = await api.getMe();
        await api.verifyCredentials(me.email, oldPw).catch(() => fail('รหัสผ่านเดิมไม่ถูกต้อง'));
        chk(await sb.auth.updateUser({ password: newPw }));
      },
      async updateMe(patch) {
        const id = await need();
        const p = chk(await sb.from('profiles').update(patch).eq('id', id).select().single());
        cachedMe = normProfile(p); return cachedMe;
      },
      async uploadImage(blob, folder = 'misc') {
        const id = await need();
        const path = `${folder}/${id}/${Date.now()}.jpg`;
        chk(await sb.storage.from('images').upload(path, blob, { contentType: 'image/jpeg', upsert: true }));
        return sb.storage.from('images').getPublicUrl(path).data.publicUrl;
      },
      async getProfiles(ids) {
        if (!ids.length) return [];
        return chk(await sb.from('profiles').select('*').in('id', ids)).map(normProfile);
      },
      async findUser(q) {
        q = q.trim();
        const rows = chk(await sb.from('profiles').select('*').or(`friend_code.eq.${q.toUpperCase()},email.eq.${q.toLowerCase()}`).limit(1));
        return normProfile(rows[0]);
      },
      async listFriends() {
        const id = await need();
        const rows = chk(await sb.from('friendships').select('friend:profiles!friendships_friend_id_fkey(*)').eq('user_id', id));
        return rows.map((r) => normProfile(r.friend)).filter(Boolean);
      },
      async addFriend(otherId) {
        chk(await sb.rpc('add_friend', { target: otherId }));
        return (await api.getProfiles([otherId]))[0];
      },
      async listGroups() {
        const id = await need();
        const mine = chk(await sb.from('group_members').select('group_id').eq('user_id', id)).map((r) => r.group_id);
        if (!mine.length) return [];
        const groups = chk(await sb.from('groups').select('*, group_members(profiles(*))').in('id', mine).order('created_at'));
        return groups.map((g) => ({
          id: g.id, name: g.name, photo_url: g.photo_url, created_by: g.created_by,
          members: (g.group_members || []).map((m) => normProfile(m.profiles)).filter(Boolean),
        }));
      },
      async createGroup({ name, photo_url = '', member_ids = [] }) {
        const id = await need();
        const g = chk(await sb.from('groups').insert({ name, photo_url, created_by: id }).select().single());
        const rows = [...new Set([id, ...member_ids])].map((u) => ({ group_id: g.id, user_id: u }));
        chk(await sb.from('group_members').insert(rows));
        return g.id;
      },
      async updateGroup(gid, patch) { chk(await sb.from('groups').update(patch).eq('id', gid)); },
      async addGroupMembers(gid, ids) {
        chk(await sb.from('group_members').upsert(ids.map((u) => ({ group_id: gid, user_id: u })), { onConflict: 'group_id,user_id', ignoreDuplicates: true }));
      },
      async removeGroupMember(gid, userId) { chk(await sb.from('group_members').delete().eq('group_id', gid).eq('user_id', userId)); },
      async deleteGroup(gid) { chk(await sb.from('groups').delete().eq('id', gid)); },
      async listFavorites() {
        const id = await need();
        return chk(await sb.from('favorites').select('restaurant_id, created_at').eq('user_id', id).order('created_at', { ascending: false }));
      },
      async toggleFavorite(rid) {
        const id = await need();
        const ex = chk(await sb.from('favorites').select('restaurant_id').eq('user_id', id).eq('restaurant_id', rid));
        if (ex.length) { chk(await sb.from('favorites').delete().eq('user_id', id).eq('restaurant_id', rid)); return false; }
        chk(await sb.from('favorites').insert({ user_id: id, restaurant_id: rid })); return true;
      },
      async listHistory() {
        const id = await need();
        return chk(await sb.from('history').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(100));
      },
      async addHistory(rid, party = []) {
        const id = await need();
        chk(await sb.from('history').insert({ user_id: id, restaurant_id: rid, party }));
      },
      async joinMeal(hostId) {
        const id = await need();
        chk(await sb.from('meal_joins').insert({ host_id: hostId, user_id: id }));
      },
      async getMealJoins(hostId, since) {
        const rows = chk(await sb.from('meal_joins').select('user_id').eq('host_id', hostId).gt('created_at', since));
        return api.getProfiles([...new Set(rows.map((r) => r.user_id))]);
      },
    };
    return api;
  }

  function thaiError(m = '') {
    if (/Invalid login/i.test(m)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if (/already registered/i.test(m)) return 'อีเมลนี้ถูกใช้สมัครแล้ว';
    if (/at least 6/i.test(m)) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (/rate limit/i.test(m)) return 'ทำรายการบ่อยเกินไป รอสักครู่แล้วลองใหม่';
    if (/Email not confirmed/i.test(m)) return 'อีเมลยังไม่ได้ยืนยัน — ให้ปิด "Confirm email" ใน Supabase';
    return m;
  }

  window.KRD = window.KRD || {};
  window.KRD.api = useSupabase ? SupabaseBackend() : DemoBackend();
})();
