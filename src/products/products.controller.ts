import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Ürünler')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('createProduct')
  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  @ApiResponse({
    status: 201,
    description: 'Ürün başarıyla oluşturuldu',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get('listProducts')
  @ApiOperation({ summary: 'Pagination ile tüm ürünleri getir' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Sayfa numarası' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Sayfa başına kayıt sayısı' })
  @ApiResponse({
    status: 200,
    description: 'Ürünler başarıyla getirildi',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }

  @Get('getProduct/:id')
  @ApiOperation({ summary: 'ID ile ürün getir' })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla getirildi',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch('updateProduct/:id')
  @ApiOperation({ summary: 'Ürün güncelle' })
  @ApiParam({ name: 'id', description: 'Ürün ID' })
  @ApiResponse({
    status: 200,
    description: 'Ürün başarıyla güncellendi',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  @ApiResponse({ status: 400, description: 'Geçersiz istek' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productsService.update(id, updateProductDto);
  }
}
