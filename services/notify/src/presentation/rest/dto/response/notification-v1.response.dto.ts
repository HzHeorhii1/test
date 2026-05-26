import { ApiProperty } from '@nestjs/swagger';

export class NotificationV1ResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  channel!: string;

  @ApiProperty()
  status!: string;
}
