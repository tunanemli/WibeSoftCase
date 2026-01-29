import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'https://example.com/image.jpg',
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        imageUrl: 'https://example.com/image.jpg',
        stock: 100,
      };

      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockProducts = [mockProduct];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([mockProducts, total]);

      const result = await service.findAll(paginationDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: mockProducts,
        total,
        page: 1,
        limit: 10,
      });
    });

    it('should use default pagination values', async () => {
      const paginationDto: PaginationDto = {};
      const mockProducts = [mockProduct];
      const total = 1;

      mockRepository.findAndCount.mockResolvedValue([mockProducts, total]);

      const result = await service.findAll(paginationDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const id = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `ID ${id} ile ürün bulunamadı`,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 149.99,
      };
      const updatedProduct = { ...mockProduct, ...updateProductDto };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(id, updateProductDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const id = 'non-existent-id';
      const updateProductDto: UpdateProductDto = { name: 'Updated Product' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.remove.mockResolvedValue(mockProduct);

      await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const id = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkStock', () => {
    it('should return product when stock is sufficient', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const quantity = 10;

      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.checkStock(productId, quantity);

      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const quantity = 150;

      mockRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.checkStock(productId, quantity)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkStock(productId, quantity)).rejects.toThrow(
        `Yetersiz stok. Mevcut: ${mockProduct.stock}, İstenen: ${quantity}`,
      );
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock successfully', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const quantity = 10;

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.decreaseStock(productId, quantity);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const quantity = 150;

      mockRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.decreaseStock(productId, quantity)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when update fails', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';
      const quantity = 10;

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.decreaseStock(productId, quantity)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.decreaseStock(productId, quantity)).rejects.toThrow(
        'Stok güncellenemedi. Stok yetersiz olabilir.',
      );
    });
  });
});
