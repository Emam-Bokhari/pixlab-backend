import "./email/email.worker";
import "./photo/photo.worker";

// workers
export { emailWorker } from "./email/email.worker";
export { photoWorker } from "./photo/photo.worker";

// queues
export { emailQueue } from "./email/email.queue";
export { photoQueue } from "./photo/photo.queue";