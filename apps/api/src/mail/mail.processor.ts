import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Processor('mail_queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<string>('MAIL_PORT')),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-welcome':
        await this.handleWelcomeEmail(job.data);
        break;
      case 'send-recovery':
        await this.handleRecoveryEmail(job.data);
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleWelcomeEmail(data: { email: string; firstName: string }) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: data.email,
        subject: 'Welcome to Sensata!',
        text: `Hi ${data.firstName || 'there'}, welcome to our platform!`,
        html: `<b>Hi ${data.firstName || 'there'}</b>, welcome to our platform!`,
      });
      this.logger.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${data.email}: ${error.message}`);
      throw error;
    }
  }

  private async handleRecoveryEmail(data: { email: string; token: string }) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const recoveryUrl = `${frontendUrl}/auth/reset-password?token=${data.token}`;
      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: data.email,
        subject: 'Password Recovery',
        text: `Reset your password using this link: ${recoveryUrl}`,
        html: `Click <a href="${recoveryUrl}">here</a> to reset your password. The link expires in 15 minutes.`,
      });
      this.logger.log(`Recovery email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send recovery email to ${data.email}: ${error.message}`);
      throw error;
    }
  }
}
