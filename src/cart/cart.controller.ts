import { Controller, Get, Param, Delete, Put, Body, Req, Post, UseGuards, HttpStatus, HttpException } from '@nestjs/common';

import { OrderService } from '../order';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) { }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get(':id')
  async findUserCart(@Param('id') id: string) {
    const { cart, total } = await this.cartService.findOrCreateByUserId(id);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart: {
          id: cart.id,
          items: cart.cart_items.map(item => ({count: item.count, product_id: item.product_id})),
        },
        total,
      },
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put(':userId')
  async updateUserCart(@Param('userId') userId: string, @Body() cartData: { products: { id: string; count: number }[] }) { // TODO: validate body payload...
    try {
      const cart = await this.cartService.addItemsToCart(userId, cartData.products);
      return {
        data: {
          cart: {
            id: cart.id,
            items: cart.cart_items.map(item => ({count: item.count, product_id: item.product_id})),
          },
          total: calculateCartTotal(cart)
        },
      };
    } catch (error) {
      throw new HttpException('Error adding items to cart.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete(':userId')
  async clearUserCart(@Param('userId') userId: string) {
    try {
      await this.cartService.removeByUserId(userId);
      return {
        message: 'Cart successfully deleted.',
      };
    } catch (error) {
      throw new HttpException('Error deleting cart.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Param('userId') userId: string, @Body() body) {
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.cart_items.length)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cart is empty',
      }
    }

    const { id: cartId, cart_items } = cart;
    const total = calculateCartTotal(cart);
    const order = this.orderService.create({
      ...body, // TODO: validate and pick only necessary data
      userId,
      cartId,
      cart_items,
      total,
    });
    this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { order }
    }
  }
}
