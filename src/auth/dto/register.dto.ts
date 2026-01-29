import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'tuna.nemli@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz' })
  email: string;

  @ApiProperty({ example: 'Tuna' })
  @IsString({ message: 'Ad alanı metin olmalıdır' })
  @IsNotEmpty({ message: 'Ad alanı boş olamaz' })
  firstName: string;

  @ApiProperty({ example: 'Nemli' })
  @IsString({ message: 'Soyad alanı metin olmalıdır' })
  @IsNotEmpty({ message: 'Soyad alanı boş olamaz' })
  lastName: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Şifre metin olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password: string;
}
