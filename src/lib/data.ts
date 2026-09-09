import { createClient } from "@/lib/supabase/server";
import { demoBooks, demoLoans } from "@/lib/demo-data";
import type { Book, LoanWithBook, Profile } from "@/lib/types";

export type BookQuery = {
  q?: string;
  category?: string;
  onlyAvailable?: boolean;
};

function filterLocally(books: Book[], query: BookQuery) {
  const q = query.q?.trim().toLowerCase();
  return books.filter((b) => {
    if (query.category && query.category !== "ทั้งหมด" && b.category !== query.category) return false;
    if (query.onlyAvailable && b.available_copies <= 0) return false;
    if (q) {
      const haystack = `${b.title} ${b.author} ${b.category} ${b.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export async function getBooks(query: BookQuery = {}): Promise<Book[]> {
  const supabase = await createClient();
  if (!supabase) return filterLocally(demoBooks, query);

  let request = supabase.from("books").select("*").order("created_at", { ascending: false });

  if (query.category && query.category !== "ทั้งหมด") {
    request = request.eq("category", query.category);
  }
  if (query.q?.trim()) {
    const term = `%${query.q.trim()}%`;
    request = request.or(`title.ilike.${term},author.ilike.${term},description.ilike.${term}`);
  }
  if (query.onlyAvailable) {
    request = request.gt("available_copies", 0);
  }

  const { data, error } = await request;
  if (error) {
    console.error("[taobary] getBooks:", error.message);
    return filterLocally(demoBooks, query);
  }
  return data ?? [];
}

export async function getBook(id: string): Promise<Book | null> {
  const supabase = await createClient();
  if (!supabase) return demoBooks.find((b) => b.id === id) ?? null;

  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[taobary] getBook:", error.message);
    return null;
  }
  return data;
}

export async function getCategories(): Promise<string[]> {
  const books = await getBooks();
  return [...new Set(books.map((b) => b.category))].sort((a, b) => a.localeCompare(b, "th"));
}

export async function getMyLoans(): Promise<LoanWithBook[]> {
  const supabase = await createClient();
  if (!supabase) return demoLoans;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from("loans")
    .select("*, book:books(*)")
    .eq("member_id", auth.user.id)
    .order("borrowed_at", { ascending: false });

  if (error) {
    console.error("[taobary] getMyLoans:", error.message);
    return [];
  }
  return (data ?? []) as unknown as LoanWithBook[];
}

/** รายการยืมที่ยังไม่คืนของหนังสือเล่มหนึ่ง (ใช้เช็คว่าผู้ใช้ยืมเล่มนี้อยู่หรือยัง) */
export async function getMyActiveLoanFor(bookId: string): Promise<LoanWithBook | null> {
  const loans = await getMyLoans();
  return loans.find((l) => l.book_id === bookId && !l.returned_at) ?? null;
}

export type SessionUser = { id: string; email: string | null; profile: Profile | null };

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();

  return { id: auth.user.id, email: auth.user.email ?? null, profile: profile ?? null };
}
