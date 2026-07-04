import { Schema, model } from 'mongoose';
import { TBlog, BlogModel } from './blog.interface';
import { BLOG_STATUS } from './blog.constant';
import { softDeletePlugin } from '../../DB/plugins/softDelete.plugin';

const blogSchema = new Schema<TBlog, BlogModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 500 },
    coverImage: { type: String },
    tags: { type: [String], default: [], index: true },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
      default: BLOG_STATUS.DRAFT,
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// indexes
blogSchema.index({ status: 1, isDeleted: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ createdAt: -1 });

// text search
blogSchema.index({
  title: 'text',
  content: 'text',
});

// apply soft delete plugin
blogSchema.plugin(softDeletePlugin);

export const Blog = model<TBlog, BlogModel>('Blog', blogSchema);
