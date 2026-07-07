import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { BgRemoveServices } from './bgRemove.service';
import sendResponse from '../../shared/sendResponse';


// POST /bg-remove  (multipart/form-data: file, bg_color optional)
const createBgRemoveJob = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id ?? (req as any).user?._id;
  const data = req.body;

  const result = await BgRemoveServices.createBgRemoveJob(userId, data);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Background removed successfully',
    data: result,
  });
});

// GET /bg-remove/:jobId
const getBgRemoveJobById = catchAsync(async (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;

  const result = await BgRemoveServices.getBgRemoveJobById(jobId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Job fetched successfully',
    data: result,
  });
});

// GET /bg-remove/me/history
const getMyBgRemoveJobs = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id ?? (req as any).user?._id;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await BgRemoveServices.getMyBgRemoveJobs(userId, limit);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'History fetched successfully',
    data: result,
  });
});

export const BgRemoveControllers = {
  createBgRemoveJob,
  getBgRemoveJobById,
  getMyBgRemoveJobs,
};