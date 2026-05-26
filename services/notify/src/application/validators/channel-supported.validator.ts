import { BadRequestException, Injectable } from '@nestjs/common';
import { ChannelType, SUPPORTED_CHANNELS } from '../../constants/channel.constants';

@Injectable()
export class ChannelSupportedValidator {
  assertSupported(channel: string): void {
    if (!SUPPORTED_CHANNELS.includes(channel.toUpperCase() as ChannelType)) {
      throw new BadRequestException(`Unsupported channel: ${channel}`);
    }
  }
}
