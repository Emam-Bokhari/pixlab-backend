import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { CONTENT_PAGE_TYPE } from './contentPage.constant';
import { ContentPageServices } from './contentPage.service';

const createContentPage = catchAsync(async (req, res) => {
  const { type, content } = req.body;

  const result = await ContentPageServices.createContentPageToDB(
    type as CONTENT_PAGE_TYPE,
    content,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${type} page created/updated successfully`,
    data: result,
  });
});

const getContentPageByType = catchAsync(async (req, res) => {
  const { type } = req.params;

  const result = await ContentPageServices.getContentPageByTypeFromDB(type as CONTENT_PAGE_TYPE);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${type} page fetched successfully`,
    data: result,
  });
});

const updateContentPageByType = catchAsync(async (req, res) => {
  const { type } = req.params;
  const { content } = req.body;

  const result = await ContentPageServices.updateContentPageByTypeToDB(
    type as CONTENT_PAGE_TYPE,
    content,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${type} page updated successfully`,
    data: result,
  });
});

const deleteContentPageByType = catchAsync(async (req, res) => {
  const { type } = req.params;

  const result = await ContentPageServices.deleteContetPageByTypeFromDB(type as CONTENT_PAGE_TYPE);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${type} page deleted successfully`,
    data: result,
  });
});

export const ContentPageControllers = {
  createContentPage,
  getContentPageByType,
  updateContentPageByType,
  deleteContentPageByType,
};
