import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Oyun Bilgisayarı' })
  @IsString({ message: 'Ürün adı metin olmalıdır' })
  @IsNotEmpty({ message: 'Ürün adı boş olamaz' })
  name: string;

  @ApiProperty({ example: 'oyun bilgisayarı', required: false })
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 9999.99 })
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır' })
  @Min(0, { message: 'Fiyat 0 veya daha büyük olmalıdır' })
  price: number;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsUrl({}, { message: 'Geçerli bir URL giriniz' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 100 })
  @IsNumber({}, { message: 'Stok sayı olmalıdır' })
  @Min(0, { message: 'Stok 0 veya daha büyük olmalıdır' })
  stock: number;
}
