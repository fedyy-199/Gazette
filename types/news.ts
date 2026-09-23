export interface ArticleFraming {
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  label?: string;
  isPending?: boolean;
}

export interface NewsArticleItem {
  id: string;
  category: string;
  location: string;
  title: string;
  imageUrl: string;
  sourceCount: number;
  framing: ArticleFraming;
  url?: string;
  publishedAt?: string;
}
