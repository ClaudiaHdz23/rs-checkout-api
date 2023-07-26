import { Cart } from '../entities/cart.entity';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart: Cart): number {
  return cart ? cart.cart_items.reduce((acc, item) => acc + item.count, 0) : 0;
}
