import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  product: ProductResponseDto;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPrice: number;
}
