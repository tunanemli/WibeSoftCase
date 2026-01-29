import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { getSessionId } from '../common/utils/session.util';

@ApiTags('Sepet')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('addItemToCart')
  @ApiOperation({ summary: 'Sepete ürün ekle' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Ürün sepete başarıyla eklendi',
  })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async addToCart(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const sessionId = getSessionId(headers);
    return await this.cartService.addToCart(sessionId, addToCartDto);
  }

  @Get('getCart')
  @ApiOperation({ summary: 'Sepet içeriğini getir' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Sepet başarıyla getirildi',
    type: CartResponseDto,
  })
  async getCart(@Headers() headers: Record<string, string | string[] | undefined>) {
    const sessionId = getSessionId(headers);
    return await this.cartService.getCart(sessionId);
  }

  @Patch('updateCartItem/:id')
  @ApiOperation({ summary: 'Sepetteki ürün miktarını güncelle' })
  @ApiParam({ name: 'id', description: 'Sepet öğesi ID' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Sepet öğesi başarıyla güncellendi',
  })
  @ApiResponse({ status: 404, description: 'Sepet öğesi bulunamadı' })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  async updateCartItem(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const sessionId = getSessionId(headers);
    return await this.cartService.updateCartItem(
      sessionId,
      id,
      updateCartItemDto,
    );
  }

  @Delete('removeItemFromCart/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sepetten ürün çıkar' })
  @ApiParam({ name: 'id', description: 'Sepet öğesi ID' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiResponse({ status: 204, description: 'Ürün sepetten çıkarıldı' })
  @ApiResponse({ status: 404, description: 'Sepet öğesi bulunamadı' })
  async removeFromCart(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
  ) {
    const sessionId = getSessionId(headers);
    await this.cartService.removeFromCart(sessionId, id);
  }

  @Delete('clearCart')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sepeti tamamen temizle' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiResponse({ status: 204, description: 'Sepet başarıyla temizlendi' })
  async clearCart(@Headers() headers: Record<string, string | string[] | undefined>) {
    const sessionId = getSessionId(headers);
    await this.cartService.clearCart(sessionId);
  }
}
