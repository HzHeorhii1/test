import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';
import { ChannelType } from '../../../../constants/channel.constants';

export class SendNotificationRequestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ChannelType })
  @IsEnum(ChannelType)
  channel!: ChannelType;

  @ApiProperty({ example: 'Your verification code is 1234', minLength: 1 })
  @IsString()
  @MinLength(1)
  message!: string;
}
