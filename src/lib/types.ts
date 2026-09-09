export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  total_copies: number;
  /** คอลัมน์จริงในตาราง books — ถูกทำให้ตรงกับตาราง loans ด้วย trigger */
  available_copies: number;
  /** สีประจำเล่มจากสคีมาเดิม (แอปยังไม่ได้ใช้ ปกใช้โทนเขียวของธีม) */
  color: string | null;
  created_at: string;
  description: string | null;
  isbn: string | null;
  published_year: number | null;
  cover_url: string | null;
};

export type LoanStatus = "borrowed" | "returned" | "overdue";

export type Loan = {
  id: string;
  book_id: string;
  member_id: string;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  status: LoanStatus;
  created_at: string;
};

export type LoanWithBook = Loan & {
  book: Book;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: "member" | "admin";
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      books: {
        Row: Book;
        Insert: Partial<Omit<Book, "id" | "created_at">> & Pick<Book, "title" | "author">;
        Update: Partial<Book>;
        Relationships: [];
      };
      loans: {
        Row: Loan;
        Insert: Partial<Omit<Loan, "id" | "created_at">> & Pick<Loan, "book_id" | "member_id">;
        Update: Partial<Loan>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      borrow_book: {
        Args: { p_book_id: string; p_days?: number };
        Returns: Loan;
      };
      return_book: {
        Args: { p_loan_id: string };
        Returns: Loan;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
