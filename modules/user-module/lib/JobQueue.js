import BeeQueue from 'bee-queue';
import redisConfig from '../config/redisDB/redis-config';

import emailWelcomeNewUser from '../src/jobs/emails/WelcomeNewUser';
import emailUpdatedUser from '../src/jobs/emails/UpdatedUser';
import emailDeletedUser from '../src/jobs/emails/DeletedUser';

const jobs = [emailWelcomeNewUser, emailUpdatedUser, emailDeletedUser];

class JobQueue {
  constructor() {
    this.jobQueues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.jobQueues[key] = {
        bee: new BeeQueue(key, { redis: redisConfig }),
        handle,
      };
    });
  }

  add(key, job) {
    return this.jobQueues[key].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach((job) => {
      const { bee, handle } = this.jobQueues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.error(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new JobQueue();
