/* =========================================================
   หน้าผู้จัดทำ — ใช้การ์ดแบบเดียวกับการ์ดโปรไฟล์
   ✏️ แก้ข้อมูลทีมได้ที่ TEAM ด้านล่าง
   รูป: วางไฟล์ที่ assets/team/<key>.jpg (เช่น assets/team/tako.jpg) ถ้าไม่มี จะแสดงตัวอักษรแรกของชื่อแทน
   ========================================================= */
const TEAM = [
  { key: 'tako', nick: 'ตะโก้', fullName: 'อภิสิทธิ์ เพ็ชรขุ้ม', studentId: '681310393', role: 'หน้าสุ่มเลย', mbti: 'ENFJ', bio: 'tokameanstar' },
  { key: 'kao', nick: 'เก้า', fullName: 'ศุภณัฐ อาชญาทา', studentId: '681310390', role: 'หน้าสุ่มเลย', mbti: 'ISFP', bio: 'ฝีมืออีโก้ ปีโป้ปีศาจ' },
  { key: 'poy', nick: 'ปอย', fullName: 'ปวิชญา บุญมา', studentId: '681310740', role: 'หน้าประวัติ', mbti: 'ISFP', bio: 'ofc angels are real, i exist.' },
  { key: 'money', nick: 'มันนี่', fullName: 'มีนรวี รัตนปรีชาชัย', studentId: '681310756 ', role: 'หน้าโปรไฟล์', mbti: 'INFP', bio: 'MoneyMeansMoney' },
  { key: 'regency', nick: 'รีเจ้นซี่', fullName: 'จิตรานุช ดีใจ', studentId: '681310510', role: 'หน้าสมาชิก', mbti: 'ENFJ', bio: 'ไทยบ้านทั้งใจ' },
];

(async function () {
  const { esc, mbtiBadge, assetImg } = KRD;
  await KRD.boot('team');
  const colors = ['#FDE8B0', '#D7E8B8', '#F3D1DF', '#D8EAF6', '#F6DD78'];
  document.getElementById('page').innerHTML = `
    <div class="container">
      <div class="page-title"><h1>ผู้จัดทำ</h1><p>ทีมกินรัยดี · คณะเทคโนโลยีสารสนเทศและการสื่อสาร มหาวิทยาลัยศิลปากร</p></div>
      <div class="team-list">
        ${TEAM.map((m, i) => `
          <section class="profile-card team-card">
            <div class="avatar-wrap">
              <span class="avatar lg" style="background:${colors[i % colors.length]}">
                ${assetImg(`team/${m.key}.jpg`, { alt: m.nick, text: m.nick.charAt(0), lazy: false })}
              </span>
            </div>
            <div>
              <h1>${esc(m.nick)}</h1>
              <div class="who-line"><span class="email">${esc(m.fullName)}</span>${mbtiBadge(m.mbti)}</div>
              <p class="team-meta">${esc(m.studentId)} · ${esc(m.role)}</p>
              <p class="bio">${esc(m.bio)}</p>
            </div>
          </section>`).join('')}
      </div>
    </div>`;
})();
