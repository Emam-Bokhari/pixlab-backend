import { HttpError } from '../../errors/HttpError';
import { CONTENT_PAGE_TYPE } from './contentPage.constant';
import { ContentPage } from './contentPage.model';

const createContentPageToDB = async (type: CONTENT_PAGE_TYPE, content: string) => {
  const result = await ContentPage.findOneAndUpdate(
    { type },
    { content, type },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!result) {
    throw new HttpError(404, 'Failed to create or update content page');
  }

  return result;
};

const getContentPageByTypeFromDB = async (type: CONTENT_PAGE_TYPE) => {
  const result = await ContentPage.findOne({ type: type.toUpperCase() });
  if (!result) {
    throw new HttpError(404, 'No content page found in the database by given type');
  }
  return result;
};

const updateContentPageByTypeToDB = async (type: CONTENT_PAGE_TYPE, content: string) => {
  const result = await ContentPage.findOneAndUpdate(
    { type: type.toUpperCase() },
    { content },
    { new: true },
  );

  if (!result) {
    throw new HttpError(404, `${type} not found in the database`);
  }

  return result;
};

const deleteContetPageByTypeFromDB = async (type: CONTENT_PAGE_TYPE) => {
  const result = await ContentPage.findOneAndDelete({
    type: type.toUpperCase(),
  });
  if (!result) {
    throw new HttpError(404, `${type} not found in the database`);
  }
  return result;
};

export const ContentPageServices = {
  createContentPageToDB,
  getContentPageByTypeFromDB,
  updateContentPageByTypeToDB,
  deleteContetPageByTypeFromDB,
};
