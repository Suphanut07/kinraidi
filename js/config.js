/* =========================================================
   ตั้งค่า Supabase
   - ถ้าเว้นว่างไว้ เว็บจะทำงานใน "โหมดเดโม" (เก็บข้อมูลใน browser เครื่องนี้เท่านั้น)
   - ใส่ค่าจาก Supabase > Project Settings > API เพื่อใช้ระบบจริงข้ามเครื่อง
   ========================================================= */
window.KRD_CONFIG = {
  // ลบค่า 2 บรรทัดนี้ให้เป็น '' ถ้าอยากกลับไปใช้โหมดเดโม
  SUPABASE_URL: 'https://tsimegiealjfeqtonczv.supabase.co',
  // anon public key — ใส่ในหน้าเว็บได้ ปลอดภัยเพราะมี RLS คุมสิทธิ์ในฐานข้อมูล
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaW1lZ2llYWxqZmVxdG9uY3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzg4MjEsImV4cCI6MjEwODg1NDgyMX0.VdHFBre2uYA6roCXo7EjesiCU4mD8DMTOkq9Uzs8Gl0',

  // ที่เก็บรูปบน Supabase Storage (bucket "restaurants") — ใช้เมื่อไม่มีไฟล์ในโฟลเดอร์ assets/
  IMG_BASE: 'https://tsimegiealjfeqtonczv.supabase.co/storage/v1/object/public/restaurants',

  // พิกัดอ้างอิง (ม.ศิลปากร วิทยาเขตพระราชวังสนามจันทร์) ใช้เมื่อผู้ใช้ไม่อนุญาตตำแหน่ง
  CAMPUS: { lat: 13.8195, lng: 100.0410 },
  NEAR_KM: 3,              // "ใกล้ฉัน" = ไม่เกินกี่กิโลเมตร
};
