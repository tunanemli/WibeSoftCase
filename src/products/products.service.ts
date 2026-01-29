import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`ID ${id} ile ürün bulunamadı`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    return this.productRepository.save(product);
  }

  async checkStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Yetersiz stok. Mevcut: ${product.stock}, İstenen: ${quantity}`,
      );
    }

    return product;
  }

  async decreaseStock(
    productId: string,
    quantity: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(Product)
      : this.productRepository;

    const product = await repository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException(`ID ${productId} ile ürün bulunamadı`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Yetersiz stok. Mevcut: ${product.stock}, İstenen: ${quantity}`,
      );
    }

    const queryBuilder = manager
      ? manager.createQueryBuilder().update(Product)
      : repository.createQueryBuilder().update(Product);

    const result = await queryBuilder
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id', { id: productId })
      .andWhere('stock >= :quantity', { quantity })
      .execute();

    if (result.affected === 0) {
      throw new BadRequestException(
        'Stok güncellenemedi. Stok yetersiz olabilir.',
      );
    }
  }
}
