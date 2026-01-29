import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registerUser')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluştur' })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla kaydedildi',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Kullanıcı zaten mevcut' })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('loginUser')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Kullanıcı girişi yap' })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('getProfile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut kullanıcı profilini getir' })
  @ApiResponse({ status: 200, description: 'Profil başarıyla getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getProfile(@CurrentUser() user: { userId: string; email: string }) {
    return { userId: user.userId, email: user.email };
  }
}
