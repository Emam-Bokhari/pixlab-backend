import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { FaqServices } from './faq.service';

const createFaq = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await FaqServices.createFaqToDB(data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Faq Created Successfully',
    data: result,
  });
});

const getFaqs = catchAsync(async (req, res) => {
  const result = await FaqServices.getFaqsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Faqs are retrieved Successfully',
    data: result,
  });
});

const updateFaqById = catchAsync(async (req, res) => {
  const { faqId } = req.params as { faqId: string };
  const payload = req.body;
  const result = await FaqServices.updateFaqByIdToDB(faqId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Faq Updated Successfully',
    data: result,
  });
});

const deleteByIdFaq = catchAsync(async (req, res) => {
  const { faqId } = req.params as { faqId: string };
  const result = await FaqServices.deleteFaqByIdToDB(faqId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Faq Deleted Successfully',
    data: result,
  });
});

const restoreAllFaqs = catchAsync(async (req, res) => {
  const result = await FaqServices.restoreAllFaqsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully restore all deleted faqs',
    data: result,
  });
});

export const FaqControllers = {
  createFaq,
  getFaqs,
  updateFaqById,
  deleteByIdFaq,
  restoreAllFaqs,
};
