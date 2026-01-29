import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Oyun Bilgisayarı' })
  name: string;

  @ApiProperty({ example: 'oyun bilgisayarı', required: false })
  description?: string;

  @ApiProperty({ example: 9999.99 })
  price: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  imageUrl?: string;

  @ApiProperty({ example: 100 })
  stock: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
