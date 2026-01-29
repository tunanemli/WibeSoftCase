import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt({ message: 'Miktar tam sayı olmalıdır' })
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;
}
