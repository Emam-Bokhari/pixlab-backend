import { defaultJobOptions, connection } from './../../app/config/bull';

import { Queue } from 'bullmq';

export const photoQueue = new Queue('photoQueue', {
  connection,
  defaultJobOptions,
});
