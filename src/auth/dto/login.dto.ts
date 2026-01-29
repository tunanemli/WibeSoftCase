import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'tuna.nemli@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Şifre metin olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  password: string;
}
