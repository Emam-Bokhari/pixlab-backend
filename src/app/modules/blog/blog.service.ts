import QueryBuilder from '../../buiilder/QueryBuilder';
import { HttpError } from '../../errors/HttpError';
import { sendRealtimeNotification } from '../../helpers/notificationHelper';
import { sendPushNotification } from '../../helpers/pushNotificationHelper';
import unlinkFile from '../../shared/unlinkFile';
import { USER_ROLE } from '../../types/enum';
import { NOTIFICATION_TYPE } from '../notification/notification.constant';
import { User } from '../user/user.model';
import { TBlog } from './blog.interface';
import { Blog } from './blog.model';

const createBlogToDB = async (payload: TBlog) => {
  const result = await Blog.create(payload);
  if (!result) {
    if (payload?.coverImage) {
      await unlinkFile(payload.coverImage);
    }
    throw new HttpError(400, 'Failed to create blog');
  }

  // send push notification to all users
  const users = await User.find({ isDeleted: false }).select('_id');
  const userIds = users.map((user) => user._id.toString());

  if (userIds.length > 0) {
    await sendPushNotification(userIds, {
      title: 'New blog posted',
      body: result.title,
      type: NOTIFICATION_TYPE.NEW_BLOG_POST,
      data: {
        blogId: result._id.toString(),
      },
    });
  }

  // Send real-time notification to admins
  const admins = await User.find({
    role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN] },
  }).select('_id');

  const adminIds = admins.map((admin) => admin._id.toString());

  if (adminIds.length > 0) {
    sendRealtimeNotification(adminIds, {
      title: 'New blog post created',
      body: `A new blog titled "${result.title}" has been published.`,
      type: NOTIFICATION_TYPE.NEW_BLOG_POST,
    });
  }

  return result;
};

const getAllBlogsFromDB = async (query: Record<string, any>) => {
  const baseQuery = Blog.find({ isDeleted: { $ne: true } });

  const blogQuery = new QueryBuilder<TBlog>(baseQuery, query)
    .search(['title', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await blogQuery.modelQuery;

  if (!result || result.length === 0) {
    throw new HttpError(404, 'No blogs found');
  }

  const meta = await blogQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getBlogByIdFromDB = async (blogId: string) => {
  const result = await Blog.findById(blogId);

  if (!result) {
    throw new HttpError(404, 'Blog not found');
  }

  return result;
};

const updateBlogByIdToDB = async (blogId: string, payload: Partial<TBlog>) => {
  const existing = await Blog.findById(blogId);

  if (!existing) {
    throw new HttpError(404, 'Blog not found');
  }

  if (payload.coverImage && existing.coverImage) {
    await unlinkFile(existing.coverImage);
  }

  const updated = await Blog.findByIdAndUpdate(blogId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new HttpError(400, 'Failed to update blog');
  }

  return updated;
};

const deleteBlogByIdToDB = async (blogId: string) => {
  const existing = await Blog.findById(blogId);

  if (!existing) {
    throw new HttpError(404, 'Blog not found');
  }

  if (existing.coverImage) {
    await unlinkFile(existing.coverImage);
  }

  const result = await Blog.softDeleteById(blogId);

  if (!result) {
    throw new HttpError(400, 'Failed to delete blog');
  }

  return result;
};

const toggleFeaturedBlogByIdToDB = async (blogId: string) => {
  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new HttpError(404, 'Blog not found');
  }

  blog.isFeatured = !blog.isFeatured;

  const result = await blog.save();

  if (!result) {
    throw new HttpError(400, 'Failed to update featured status');
  }

  return result;
};

const getFeaturedBlogsFromDB = async () => {
  const result = await Blog.find({
    isFeatured: true,
  });

  if (!result || result.length === 0) {
    throw new HttpError(404, 'No featured blogs found');
  }

  return result;
};

export const BlogServices = {
  createBlogToDB,
  getAllBlogsFromDB,
  getBlogByIdFromDB,
  updateBlogByIdToDB,
  deleteBlogByIdToDB,
  toggleFeaturedBlogByIdToDB,
  getFeaturedBlogsFromDB,
};
