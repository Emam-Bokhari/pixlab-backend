import IORedis from 'ioredis';
import config from '.';

export const connection = new IORedis({
  host: config.redis.redis_host,
  port: Number(config.redis.redis_port as string),
  password: config.redis.redis_password,
  maxRetriesPerRequest: null,
});

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  // removeOnComplete: true,
  removeOnComplete: {
    age: 3600,
  },
  removeOnFail: false,
};
