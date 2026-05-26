import { ValueObjectBase } from '@spherax/common';
import { ChannelType, SUPPORTED_CHANNELS } from '../../../constants/channel.constants';

export { ChannelType };

export class Channel extends ValueObjectBase<ChannelType> {
  constructor(value: string) {
    const upper = value.toUpperCase() as ChannelType;
    if (!SUPPORTED_CHANNELS.includes(upper)) {
      throw new Error(
        `Unsupported channel: ${value}. Must be one of ${SUPPORTED_CHANNELS.join(', ')}`,
      );
    }
    super(upper);
  }

  static fromPersistence(raw: ChannelType): Channel {
    return Channel._fromPersistence(raw) as Channel;
  }
}
