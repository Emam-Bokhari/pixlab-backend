import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { BlogServices } from './blog.service';

const createBlog = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await BlogServices.createBlogToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Successfully create a blog',
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getAllBlogsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Blogs retrieved successfully',
    data: result,
  });
});

const getBlogById = catchAsync(async (req, res) => {
  const { blogId } = req.params as { blogId: string };

  const result = await BlogServices.getBlogByIdFromDB(blogId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Blog retrieved successfully',
    data: result,
  });
});

const updateBlogById = catchAsync(async (req, res) => {
  const { blogId } = req.params as { blogId: string };

  const result = await BlogServices.updateBlogByIdToDB(blogId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Blog updated successfully',
    data: result,
  });
});

const deleteBlogById = catchAsync(async (req, res) => {
  const { blogId } = req.params as { blogId: string };

  const result = await BlogServices.deleteBlogByIdToDB(blogId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Blog deleted successfully',
    data: result,
  });
});

const toggleFeaturedBlog = catchAsync(async (req, res) => {
  const { blogId } = req.params as { blogId: string };

  const result = await BlogServices.toggleFeaturedBlogByIdToDB(blogId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Featured status updated successfully',
    data: result,
  });
});

const getFeaturedBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getFeaturedBlogsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Featured blogs retrieved successfully',
    data: result,
  });
});

export const BlogControllers = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  toggleFeaturedBlog,
  getFeaturedBlogs,
};
