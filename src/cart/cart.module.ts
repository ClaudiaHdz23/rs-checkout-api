import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemRepository } from './cart-item.repository';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';


@Module({
  imports: [ 
    TypeOrmModule.forFeature([Cart, CartItem, CartItemRepository]),
    OrderModule
  ],
  providers: [ CartService ],
  controllers: [ CartController ]
})
export class CartModule {}
