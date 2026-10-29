/* =========================================================
   หน้าผู้จัดทำ — ใช้การ์ดแบบเดียวกับการ์ดโปรไฟล์
   ✏️ แก้ข้อมูลทีมได้ที่ TEAM ด้านล่าง
   รูป: วางไฟล์ที่ assets/team/<key>.jpg (เช่น assets/team/tako.jpg) ถ้าไม่มี จะแสดงตัวอักษรแรกของชื่อแทน
   ========================================================= */
const TEAM = [
  { key: 'tako', nick: 'ตะโก้', fullName: 'ชื่อ-นามสกุล', studentId: 'รหัสนักศึกษา', role: 'หน้าที่ในทีม', mbti: 'ENFJ', bio: 'คำแนะนำตัวสั้นๆ' },
  { key: 'kao', nick: 'เก้า', fullName: 'ชื่อ-นามสกุล', studentId: 'รหัสนักศึกษา', role: 'หน้าที่ในทีม', mbti: 'ISFP', bio: 'คำแนะนำตัวสั้นๆ' },
  { key: 'poy', nick: 'ปอย', fullName: 'ชื่อ-นามสกุล', studentId: 'รหัสนักศึกษา', role: 'หน้าที่ในทีม', mbti: 'ISFJ', bio: 'คำแนะนำตัวสั้นๆ' },
  { key: 'money', nick: 'มันนี่', fullName: 'ชื่อ-นามสกุล', studentId: 'รหัสนักศึกษา', role: 'หน้าที่ในทีม', mbti: 'INFJ', bio: 'คำแนะนำตัวสั้นๆ' },
  { key: 'regency', nick: 'รีเจ้นซี่', fullName: 'ชื่อ-นามสกุล', studentId: 'รหัสนักศึกษา', role: 'หน้าที่ในทีม', mbti: 'ESFJ', bio: 'คำแนะนำตัวสั้นๆ' },
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
