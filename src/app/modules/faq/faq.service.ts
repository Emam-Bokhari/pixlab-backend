import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../../errors/HttpError';
import { TFaq } from './faq.interface';
import { Faq } from './faq.model';
import mongoose from 'mongoose';

const createFaqToDB = async (payload: TFaq) => {
  const faq = await Faq.create(payload);
  if (!faq) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to created Faq');
  }

  return faq;
};

const getFaqsFromDB = async () => {
  const faqs = await Faq.find({});
  if (!faqs || faqs.length === 0) {
    throw new HttpError(404, "No faq's found in the database");
  }
  return faqs;
};

const updateFaqByIdToDB = async (id: string, payload: TFaq) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid Object ID');
  }

  const updatedFaq = await Faq.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!updatedFaq) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Failed to updated Faq');
  }

  return updatedFaq;
};

const deleteFaqByIdToDB = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid Object ID');
  }

  const result = await Faq.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new HttpError(404, 'Failed to delete faq');
  }

  return result;
};

const restoreAllFaqsFromDB = async () => {
  const result = await Faq.restoreMany({});

  if (!result) {
    throw new HttpError(400, 'Failed to restore faqs');
  }

  return result;
};

export const FaqServices = {
  createFaqToDB,
  getFaqsFromDB,
  updateFaqByIdToDB,
  deleteFaqByIdToDB,
  restoreAllFaqsFromDB,
};
