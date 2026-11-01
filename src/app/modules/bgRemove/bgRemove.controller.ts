import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import { BgRemoveServices } from './bgRemove.service';
import sendResponse from '../../shared/sendResponse';

const createBgRemoveJob = catchAsync(async (req: Request, res: Response) => {
  const result = await BgRemoveServices.createBgRemoveJob(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Background removed successfully',
    data: result,
  });
});

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

const getAllBgRemoveJobs = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await BgRemoveServices.getAllBgRemoveJobs(limit);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Jobs fetched successfully',
    data: result,
  });
});

export const BgRemoveControllers = {
  createBgRemoveJob,
  getBgRemoveJobById,
  getAllBgRemoveJobs,
};
