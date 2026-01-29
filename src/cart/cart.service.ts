import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async addToCart(
    sessionId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartItem> {
    const { productId, quantity } = addToCartDto;

    await this.productsService.checkStock(productId, quantity);

    const existingCartItem = await this.cartItemRepository.findOne({
      where: { sessionId, productId },
      relations: ['product'],
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      await this.productsService.checkStock(productId, newQuantity);
      existingCartItem.quantity = newQuantity;
      return this.cartItemRepository.save(existingCartItem);
    }

    const cartItem = this.cartItemRepository.create({
      sessionId,
      productId,
      quantity,
    });

    return this.cartItemRepository.save(cartItem);
  }

  async getCart(sessionId: string): Promise<{
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
  }> {
    const cartItems = await this.cartItemRepository.find({
      where: { sessionId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    const totalItems = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return {
      items: cartItems,
      totalItems,
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }

  async updateCartItem(
    sessionId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, sessionId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Sepetinizde ID ${cartItemId} ile ürün bulunamadı`,
      );
    }

    await this.productsService.checkStock(
      cartItem.productId,
      updateCartItemDto.quantity,
    );

    cartItem.quantity = updateCartItemDto.quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeFromCart(sessionId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, sessionId },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Sepetinizde ID ${cartItemId} ile ürün bulunamadı`,
      );
    }

    await this.cartItemRepository.remove(cartItem);
  }

  async clearCart(sessionId: string): Promise<void> {
    await this.cartItemRepository.delete({ sessionId });
  }
}
