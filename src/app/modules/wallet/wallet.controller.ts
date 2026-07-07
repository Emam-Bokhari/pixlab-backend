import { Request, Response } from 'express';

import { WalletServices } from './wallet.service';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';

// GET /wallet/me
const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const result = await WalletServices.getWalletSummary(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Wallet fetched successfully',
    data: result,
  });
});

// GET /wallet/me/history
const getMyCreditHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const result = await WalletServices.getCreditHistory(userId, limit);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Credit history fetched successfully',
    data: result,
  });
});

export const WalletControllers = {
  getMyWallet,
  getMyCreditHistory,
};
