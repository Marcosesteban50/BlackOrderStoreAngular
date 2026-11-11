export interface GuideSummary {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  level: string | null;
  expansion: string | null;
  publishedAt: string | null;
  isPublished: boolean;
  viewCount: number;
}

export interface Guide extends GuideSummary {
  contentHtml: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  media: GuideMedia[];
}

export interface GuideMedia {
  id: string;
  mediaType: 'Video' | 'Image' | string;
  provider: string;
  url: string;
  externalId: string | null;
  caption: string | null;
  durationSeconds: number | null;
  sortOrder: number;
}

export interface GuideCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface SaveGuideCategory {
  name: string;
  slug?: string | null;
  description?: string | null;
  sortOrder: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GuideFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  level?: string;
}
