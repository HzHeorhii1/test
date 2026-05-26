export const EMAIL_SENDER_PORT = Symbol('EMAIL_SENDER_PORT');

export interface EmailSenderPort {
  send(to: string, subject: string, text: string): Promise<void>;
}
