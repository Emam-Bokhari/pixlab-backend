import express from 'express';
import { isAdmin } from '../../helpers/auth.helper';
import { BlogControllers } from './blog.controller';
import { validateRequestSchema } from '../../middlewares/validateRequestSchema';
import { BlogValidationSchema } from './blog.validation';
import { parseFileData } from '../../middlewares/parseFileData';
import { fileUploadHandler } from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    isAdmin,
    fileUploadHandler(),
    parseFileData('coverImage', {
      fieldName: 'coverImage',
      mode: 'single',
    }),
    validateRequestSchema(BlogValidationSchema.createBlogZodSchema),
    BlogControllers.createBlog,
  )
  .get(BlogControllers.getAllBlogs);

router.route('/featured').get(BlogControllers.getFeaturedBlogs);

router
  .route('/:blogId')
  .get(BlogControllers.getBlogById)
  .patch(
    isAdmin,
    fileUploadHandler(),
    parseFileData('coverImage', {
      fieldName: 'coverImage',
      mode: 'single',
    }),
    validateRequestSchema(BlogValidationSchema.updateBlogZodSchema),
    BlogControllers.updateBlogById,
  )
  .delete(isAdmin, BlogControllers.deleteBlogById);

router.route('/:blogId/featured').patch(isAdmin, BlogControllers.toggleFeaturedBlog);

export const BlogRoutes = router;
