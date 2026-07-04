import { defaultJobOptions, connection } from './../../app/config/bull';

import { Queue } from "bullmq";

export const emailQueue = new Queue("emailQueue", {
    connection,
    defaultJobOptions,
})

