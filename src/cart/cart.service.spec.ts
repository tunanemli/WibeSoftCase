import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartService', () => {
  let service: CartService;
  let repository: Repository<CartItem>;
  let productsService: ProductsService;

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

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockProductsService = {
    checkStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    repository = module.get<Repository<CartItem>>(
      getRepositoryToken(CartItem),
    );
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      const sessionId = 'session-id';
      const addToCartDto: AddToCartDto = {
        productId: 'product-id',
        quantity: 2,
      };

      mockProductsService.checkStock.mockResolvedValue(mockProduct);
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCartItem);
      mockRepository.save.mockResolvedValue(mockCartItem);

      const result = await service.addToCart(sessionId, addToCartDto);

      expect(mockProductsService.checkStock).toHaveBeenCalledWith(
        addToCartDto.productId,
        addToCartDto.quantity,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId, productId: addToCartDto.productId },
        relations: ['product'],
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        sessionId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      });
      expect(result).toEqual(mockCartItem);
    });

    it('should update quantity when item already exists in cart', async () => {
      const sessionId = 'session-id';
      const addToCartDto: AddToCartDto = {
        productId: 'product-id',
        quantity: 3,
      };

      const existingCartItem = { ...mockCartItem, quantity: 2 };
      const updatedCartItem = { ...existingCartItem, quantity: 5 };

      mockProductsService.checkStock.mockResolvedValue(mockProduct);
      mockRepository.findOne.mockResolvedValue(existingCartItem);
      mockProductsService.checkStock.mockResolvedValueOnce(mockProduct);
      mockProductsService.checkStock.mockResolvedValueOnce(mockProduct);
      mockRepository.save.mockResolvedValue(updatedCartItem);

      const result = await service.addToCart(sessionId, addToCartDto);

      expect(mockProductsService.checkStock).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5 }),
      );
      expect(result).toEqual(updatedCartItem);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const sessionId = 'session-id';
      const addToCartDto: AddToCartDto = {
        productId: 'product-id',
        quantity: 150,
      };

      mockProductsService.checkStock.mockRejectedValue(
        new BadRequestException('Yetersiz stok'),
      );

      await expect(service.addToCart(sessionId, addToCartDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getCart', () => {
    it('should return cart with items and totals', async () => {
      const sessionId = 'session-id';
      const product1 = { ...mockProduct, price: 99.99 };
      const product2 = { ...mockProduct, id: 'product-id-2', price: 49.99 };
      
      const cartItems = [
        {
          ...mockCartItem,
          quantity: 2,
          product: product1,
        },
        {
          ...mockCartItem,
          id: 'cart-item-id-2',
          productId: 'product-id-2',
          quantity: 3,
          product: product2,
        },
      ];

      mockRepository.find.mockResolvedValue(cartItems);

      const result = await service.getCart(sessionId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { sessionId },
        relations: ['product'],
        order: { createdAt: 'DESC' },
      });
      expect(result.totalItems).toBe(5);
      expect(result.totalPrice).toBeCloseTo(349.95, 2);
      expect(result.items).toEqual(cartItems);
    });

    it('should return empty cart when no items', async () => {
      const sessionId = 'session-id';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.getCart(sessionId);

      expect(result.totalItems).toBe(0);
      expect(result.totalPrice).toBe(0);
      expect(result.items).toEqual([]);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const sessionId = 'session-id';
      const cartItemId = 'cart-item-id';
      const updateCartItemDto: UpdateCartItemDto = { quantity: 5 };

      mockRepository.findOne.mockResolvedValue(mockCartItem);
      mockProductsService.checkStock.mockResolvedValue(mockProduct);
      const updatedCartItem = { ...mockCartItem, quantity: 5 };
      mockRepository.save.mockResolvedValue(updatedCartItem);

      const result = await service.updateCartItem(
        sessionId,
        cartItemId,
        updateCartItemDto,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: cartItemId, sessionId },
        relations: ['product'],
      });
      expect(mockProductsService.checkStock).toHaveBeenCalledWith(
        mockCartItem.productId,
        updateCartItemDto.quantity,
      );
      expect(result.quantity).toBe(5);
    });

    it('should throw NotFoundException when cart item not found', async () => {
      const sessionId = 'session-id';
      const cartItemId = 'non-existent-id';
      const updateCartItemDto: UpdateCartItemDto = { quantity: 5 };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCartItem(sessionId, cartItemId, updateCartItemDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const sessionId = 'session-id';
      const cartItemId = 'cart-item-id';

      mockRepository.findOne.mockResolvedValue(mockCartItem);
      mockRepository.remove.mockResolvedValue(mockCartItem);

      await service.removeFromCart(sessionId, cartItemId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: cartItemId, sessionId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('should throw NotFoundException when cart item not found', async () => {
      const sessionId = 'session-id';
      const cartItemId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeFromCart(sessionId, cartItemId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const sessionId = 'session-id';

      mockRepository.delete.mockResolvedValue({ affected: 2 });

      await service.clearCart(sessionId);

      expect(mockRepository.delete).toHaveBeenCalledWith({ sessionId });
    });
  });
});
