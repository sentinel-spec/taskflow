import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail_queue') private readonly mailQueue: Queue) {}

  async sendWelcomeEmail(email: string, firstName: string) {
    await this.mailQueue.add('send-welcome', {
      email,
      firstName,
    });
  }

  async sendPasswordRecoveryEmail(email: string, token: string) {
    await this.mailQueue.add('send-recovery', {
      email,
      token,
    });
  }
}
