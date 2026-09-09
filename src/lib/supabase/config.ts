export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * เว็บทำงานได้ทันทีแม้ยังไม่ได้ตั้งค่า Supabase โดยจะใช้ข้อมูลตัวอย่างในเครื่องแทน
 * เมื่อใส่ค่าใน .env.local ครบแล้ว ระบบจะสลับไปอ่าน/เขียนฐานข้อมูลจริงอัตโนมัติ
 */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
