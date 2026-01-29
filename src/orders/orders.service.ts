import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(sessionId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.cartService.getCart(sessionId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Sepet boş');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        sessionId,
        userId: createOrderDto.userId,
        status: OrderStatus.PENDING,
        totalAmount: cart.totalPrice,
      });

      const savedOrder = await queryRunner.manager.save(order);

      const orderItems = cart.items.map((cartItem) =>
        queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: Number(cartItem.product.price),
        }),
      );

      await queryRunner.manager.save(orderItems);

      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: cartItem.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `ID ${cartItem.productId} ile ürün bulunamadı`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Yetersiz stok. Mevcut: ${product.stock}, İstenen: ${cartItem.quantity}`,
          );
        }

        const result = await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock - ${cartItem.quantity}` })
          .where('id = :id', { id: cartItem.productId })
          .andWhere('stock >= :quantity', { quantity: cartItem.quantity })
          .execute();

        if (result.affected === 0) {
          throw new BadRequestException(
            'Stok güncellenemedi. Stok yetersiz olabilir.',
          );
        }
      }

      await this.cartService.clearCart(sessionId);

      await queryRunner.commitTransaction();

      return await this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(sessionId?: string, userId?: string) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    return await this.orderRepository.find({
      where,
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`ID ${id} ile sipariş bulunamadı`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }
}
