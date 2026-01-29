import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Headers,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { getSessionId } from '../common/utils/session.util';

@ApiTags('Siparişler')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('createOrder')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Sepetten sipariş oluştur' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Sipariş başarıyla oluşturuldu',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  async create(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user?: { userId: string; email: string },
  ) {
    const sessionId = getSessionId(headers);
    const userId = user?.userId || createOrderDto.userId;
    return await this.ordersService.create(sessionId, { userId });
  }

  @Get('listOrders')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Tüm siparişleri getir' })
  @ApiHeader({
    name: 'x-session-id',
    description: 'Sepet için oturum ID',
    required: false,
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'sessionId', required: false, description: 'Oturum ID' })
  @ApiResponse({
    status: 200,
    description: 'Siparişler başarıyla getirildi',
    type: [OrderResponseDto],
  })
  async findAll(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Query('sessionId') sessionId?: string,
    @CurrentUser() user?: { userId: string; email: string },
  ) {
    const sessionIdFromHeader = getSessionId(headers);
    const userId = user?.userId;
    return await this.ordersService.findAll(
      sessionId || sessionIdFromHeader,
      userId,
    );
  }

  @Get('getOrder/:id')
  @ApiOperation({ summary: 'ID ile sipariş getir' })
  @ApiParam({ name: 'id', description: 'Sipariş ID' })
  @ApiResponse({
    status: 200,
    description: 'Sipariş başarıyla getirildi',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Patch('updateOrderStatus/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sipariş durumunu güncelle' })
  @ApiParam({ name: 'id', description: 'Sipariş ID' })
  @ApiResponse({
    status: 200,
    description: 'Sipariş durumu başarıyla güncellendi',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return await this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
    );
  }
}
