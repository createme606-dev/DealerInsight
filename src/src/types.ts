export type Sentiment = 'positive' | 'neutral' | 'negative';

export type Category =
  | 'Sales'
  | 'Service'
  | 'Financing'
  | 'Pricing'
  | 'Vehicle Problems'
  | 'Wait Times'
  | 'Staff'
  | 'Parts/Repairs'
  | 'Other';

export interface FeedbackRecord {
  id: string;
  date: string;
  feedback: string;
  department?: string;
  sentiment: Sentiment;
  category: Category;
  score: number; // -100 to 100
}

export interface AnalysisSummary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  categories: Record<Category, number>;
  topProblems: { name: string; count: number }[];
  recommendations: string[];
}
