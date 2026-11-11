import { Response } from 'express';

type IData<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data?: T;
  meta?: Record<string, unknown>;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  const resData: Record<string, unknown> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
  };

  if (data.pagination !== undefined) {
    resData.pagination = data.pagination;
  }

  if (data.meta !== undefined) {
    resData.meta = data.meta;
  }

  res.status(data.statusCode).json(resData);
};

export default sendResponse;
