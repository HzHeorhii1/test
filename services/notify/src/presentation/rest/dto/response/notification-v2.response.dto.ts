import { ApiProperty } from '@nestjs/swagger';

export class NotificationV2ResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  channel!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  createdAt!: string;
}
