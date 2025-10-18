export type Comment = {
  id: string;
  quote_id: string;
  parent_id: string | null;
  body: string;
  display_name: string | null;
  created_at: number;
  updated_at: number;
  score: number;
};

