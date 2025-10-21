export type Quote = {
  id: string; // stable hash of the exact quote text
  quote: string;
  source: string;
  translationAuthor?: string;
};

