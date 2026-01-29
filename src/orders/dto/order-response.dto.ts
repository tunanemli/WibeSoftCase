import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  product: ProductResponseDto;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({ required: false })
  userId?: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
