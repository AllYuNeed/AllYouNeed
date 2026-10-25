/**
 * Types for the tables in supabase/migrations/. Written by hand to match the migration; once you have a project,
 * you can regenerate this file with `npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts`.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; company: string; phone: string; created_at: string; updated_at: string };
        // The API cannot insert profiles (the sign-up trigger does) and can update only these three columns.
        Insert: never;
        Update: { full_name?: string; company?: string; phone?: string };
        Relationships: [];
      };
      contact_requests: {
        // Insert-only from the browser; Row is what the dashboard / service role sees.
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string;
          company: string;
          team_size: string;
          modules: string[];
          message: string;
          status: "new" | "contacted" | "closed";
          created_at: string;
        };
        Insert: { name: string; email: string; phone: string; company: string; team_size: string; modules: string[]; message?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      subscribe_to_newsletter: { Args: { p_email: string; p_whatsapp?: string }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
