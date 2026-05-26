export class SendNotificationCommand {
  constructor(
    readonly userId: string,
    readonly channel: string,
    readonly message: string,
  ) {}
}
