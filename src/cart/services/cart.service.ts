import { Injectable,  NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { CartItemRepository } from '../cart-item.repository';

@Injectable()
export class CartService {
  
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: CartItemRepository,
  ) {}

  findByUserId(userId: string): Promise<Cart> {
    return this.cartRepository.findOne({ where: { user_id: userId }, relations: ['cart_items'] });
  }

  async createByUserId(userId: string): Promise<Cart> {
    const cart = this.cartRepository.create({
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      status: 'OPEN',
    });

    return this.cartRepository.save(cart);
  }

  async findOrCreateByUserId(userId: string): Promise<{ cart: Cart; total: number }> {
    const cart = await this.findByUserId(userId);

    if (!cart) {
      const newCart = await this.createByUserId(userId)
      return {
        cart: newCart,
        total: 0,
      };
    }

    const total = cart.cart_items.reduce((acc, item) => acc + item.count, 0);

    return { cart, total };
  }

  async addItemsToCart(userId: string, products: { id: string; count: number }[]): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    for (const product of products) {
      const item = cart.cart_items.find(item => item.product_id === product.id);
      if (item) {
        item.count = product.count;
      } else {
        const newItem = new CartItem();
        newItem.cart_id = cart.id;
        newItem.product_id = product.id;
        newItem.count = product.count;
        await this.cartItemRepository.save(newItem);
      }
    }

    return this.cartRepository.save(cart);
  }

  async removeByUserId(userId): Promise<void> {
    const cart = await this.cartRepository.findOne({ where: { user_id: userId } });

    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    await this.cartRepository.remove(cart);
  }

}
