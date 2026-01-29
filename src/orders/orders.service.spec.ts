import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../products/entities/product.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let cartService: CartService;
  let productsService: ProductsService;
  let dataSource: DataSource;

  const mockProduct: Product = {
    id: 'product-id',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg',
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartItem: CartItem = {
    id: 'cart-item-id',
    sessionId: 'session-id',
    productId: 'product-id',
    product: mockProduct,
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCart = {
    items: [mockCartItem],
    totalItems: 2,
    totalPrice: 199.98,
  };

  const mockOrder: Order = {
    id: 'order-id',
    sessionId: 'session-id',
    userId: 'user-id',
    status: OrderStatus.PENDING,
    totalAmount: 199.98,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItem: OrderItem = {
    id: 'order-item-id',
    orderId: 'order-id',
    order: mockOrder,
    productId: 'product-id',
    product: mockProduct,
    quantity: 2,
    price: 99.99,
    createdAt: new Date(),
  };

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockQueryRunner: Partial<QueryRunner> = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn().mockResolvedValue(mockProduct),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as any,
  };

  const mockOrderRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderItemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCartService = {
    getCart: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockProductsService = {
    decreaseStock: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    cartService = module.get<CartService>(CartService);
    productsService = module.get<ProductsService>(ProductsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const sessionId = 'session-id';
      const createOrderDto: CreateOrderDto = { userId: 'user-id' };

      const savedOrder = { ...mockOrder, id: 'new-order-id' };
      const orderWithItems = {
        ...savedOrder,
        items: [mockOrderItem],
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      (mockQueryRunner.manager.create as jest.Mock)
        .mockReturnValueOnce(savedOrder)
        .mockReturnValueOnce(mockOrderItem);
      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(savedOrder)
        .mockResolvedValueOnce([mockOrderItem]);
      (mockQueryRunner.manager.findOne as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      mockCartService.clearCart.mockResolvedValue(undefined);
      mockOrderRepository.findOne.mockResolvedValue(orderWithItems);

      const result = await service.create(sessionId, createOrderDto);

      expect(mockCartService.getCart).toHaveBeenCalledWith(sessionId);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalledWith(Product, {
        where: { id: mockCartItem.productId },
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockCartService.clearCart).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(orderWithItems);
    });

    it('should throw BadRequestException when cart is empty', async () => {
      const sessionId = 'session-id';
      const createOrderDto: CreateOrderDto = { userId: 'user-id' };

      mockCartService.getCart.mockResolvedValue({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });

      await expect(service.create(sessionId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(sessionId, createOrderDto)).rejects.toThrow(
        'Sepet boş',
      );
    });

    it('should rollback transaction on error', async () => {
      const sessionId = 'session-id';
      const createOrderDto: CreateOrderDto = { userId: 'user-id' };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
      (mockQueryRunner.manager.create as jest.Mock).mockReturnValue(mockOrder);
      (mockQueryRunner.manager.save as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(sessionId, createOrderDto)).rejects.toThrow(
        'Database error',
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return orders by userId', async () => {
      const userId = 'user-id';
      const orders = [mockOrder];

      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(undefined, userId);

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });

    it('should return orders by sessionId', async () => {
      const sessionId = 'session-id';
      const orders = [mockOrder];

      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(sessionId);

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { sessionId },
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });

    it('should return all orders when no filters', async () => {
      const orders = [mockOrder];

      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll();

      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const id = 'order-id';
      const orderWithItems = {
        ...mockOrder,
        items: [mockOrderItem],
      };

      mockOrderRepository.findOne.mockResolvedValue(orderWithItems);

      const result = await service.findOne(id);

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(orderWithItems);
    });

    it('should throw NotFoundException when order not found', async () => {
      const id = 'non-existent-id';

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `ID ${id} ile sipariş bulunamadı`,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const id = 'order-id';
      const newStatus = OrderStatus.CONFIRMED;
      const updatedOrder = { ...mockOrder, status: newStatus };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus(id, newStatus);

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['items', 'items.product'],
      });
      expect(mockOrderRepository.save).toHaveBeenCalledWith({
        ...mockOrder,
        status: newStatus,
      });
      expect(result.status).toBe(newStatus);
    });

    it('should throw NotFoundException when order not found', async () => {
      const id = 'non-existent-id';
      const newStatus = OrderStatus.CONFIRMED;

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus(id, newStatus)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
