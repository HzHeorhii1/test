import { ApiProperty } from '@nestjs/swagger';

export class UserV1ResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;
}
