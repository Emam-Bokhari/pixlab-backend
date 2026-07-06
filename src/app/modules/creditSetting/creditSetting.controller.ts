import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { CreditSettingServices } from './creditSetting.service';

const getCreditSettings = catchAsync(async (req, res) => {
  const result = await CreditSettingServices.getCreditSettingsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Credit settings retrieved successfully',
    data: result,
  });
});

const updateCreditSetting = catchAsync(async (req, res) => {
  const { key } = req.params as { key: string };
  const result = await CreditSettingServices.updateCreditSettingInDB(key, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Credit setting updated successfully',
    data: result,
  });
});

export const CreditSettingControllers = {
  getCreditSettings,
  updateCreditSetting,
};
