import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Kullanıcı ID (kimlik doğrulaması yapıldıysa)' })
  @IsOptional()
  @IsUUID(undefined, { message: 'Geçerli bir kullanıcı ID giriniz' })
  userId?: string;
}
