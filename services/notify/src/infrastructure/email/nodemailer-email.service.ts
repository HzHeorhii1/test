import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';

@Injectable()
export class NodemailerEmailService implements EmailSenderPort {
  constructor(private readonly mailer: MailerService) {}

  async send(to: string, subject: string, text: string): Promise<void> {
    await this.mailer.sendMail({ to, subject, text });
  }
}
