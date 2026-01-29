import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Oyun Bilgisayarı' })
  @IsString({ message: 'Ürün adı metin olmalıdır' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Oyun bilgisayarı' })
  @IsString({ message: 'Açıklama metin olmalıdır' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 9999.99 })
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır' })
  @Min(0, { message: 'Fiyat 0 veya daha büyük olmalıdır' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsUrl({}, { message: 'Geçerli bir URL giriniz' })
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber({}, { message: 'Stok sayı olmalıdır' })
  @Min(0, { message: 'Stok 0 veya daha büyük olmalıdır' })
  @IsOptional()
  stock?: number;
}
