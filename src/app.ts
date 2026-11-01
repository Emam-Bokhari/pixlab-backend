import cors from 'cors';
import path from 'path';
import express, { type Request, type Response } from 'express';
import { Morgan } from './app/shared/morgan';
import { Routes } from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';

const app = express();

app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

app.use(express.json());
app.use(cors());

// serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/v1', Routes.v1Routes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running...');
});

app.use(globalErrorHandler);

export default app;
