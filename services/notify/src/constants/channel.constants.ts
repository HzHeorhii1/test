export enum ChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export const SUPPORTED_CHANNELS: readonly ChannelType[] = [
  ChannelType.EMAIL,
  ChannelType.SMS,
  ChannelType.PUSH,
];
