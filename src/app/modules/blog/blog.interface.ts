import { ISoftDeleteModel } from '../../types/softDelete.interface';
import { BLOG_STATUS } from './blog.constant';

export interface TBlog {
  title: string;
  content: string; // HTML or Markdown
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  status: BLOG_STATUS;
  metrics: {
    views: number;
    likes: number;
  };
  isFeatured: boolean;
  readTime?: number;
  publishedAt?: Date;
}

export type BlogModel = ISoftDeleteModel<TBlog>;
