import { Request, Response, NextFunction } from 'express';
import { WalletServices } from '../modules/wallet/wallet.service';
import catchAsync from '../shared/catchAsync';

export const requireCredits = (operationKey: string) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // validateCreditsForOperation throws HttpError(400, 'Insufficient credits') if check fails
    await WalletServices.validateCreditsForOperation(userId, operationKey);

    next();
  });
};
