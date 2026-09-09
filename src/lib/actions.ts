"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; message: string };

const DEMO_NOTICE =
  "ตอนนี้เป็นโหมดตัวอย่าง (ยังไม่ได้เชื่อม Supabase) — ตั้งค่า .env.local แล้วรีสตาร์ตเพื่อบันทึกข้อมูลจริง";

export async function borrowBook(bookId: string, days = 14): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: DEMO_NOTICE };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=/books/${bookId}`);

  const { error } = await supabase.rpc("borrow_book", { p_book_id: bookId, p_days: days });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath(`/books/${bookId}`);
  revalidatePath("/my-loans");
  return { ok: true, message: "ยืมสำเร็จ ดูกำหนดคืนได้ที่หน้า “การยืมของฉัน”" };
}

export async function returnBook(loanId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: DEMO_NOTICE };

  const { error } = await supabase.rpc("return_book", { p_loan_id: loanId });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/my-loans");
  return { ok: true, message: "คืนหนังสือเรียบร้อย ขอบคุณครับ" };
}

export async function createBook(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: DEMO_NOTICE };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: "ต้องเข้าสู่ระบบก่อน" };

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  if (!title || !author) return { ok: false, message: "กรุณากรอกชื่อหนังสือและผู้แต่ง" };

  const yearRaw = String(formData.get("published_year") ?? "").trim();

  const { error } = await supabase.from("books").insert({
    title,
    author,
    category: String(formData.get("category") ?? "").trim() || "ทั่วไป",
    description: String(formData.get("description") ?? "").trim() || null,
    isbn: String(formData.get("isbn") ?? "").trim() || null,
    published_year: yearRaw ? Number(yearRaw) : null,
    total_copies: Number(formData.get("total_copies") ?? 1) || 1,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: `เพิ่ม “${title}” เข้าคลังแล้ว` };
}

export async function deleteBook(bookId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: DEMO_NOTICE };

  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "ลบหนังสือแล้ว" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
