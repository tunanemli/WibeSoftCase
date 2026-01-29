import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsUUID(undefined, { message: 'Geçerli bir ürün ID giriniz' })
  productId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt({ message: 'Miktar tam sayı olmalıdır' })
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;
}
