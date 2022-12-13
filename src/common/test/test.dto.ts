import Chance from 'chance';
import { Cart } from '../../cart/cart.dto';
import { Order } from '../../order/order.dto';
import { Product } from '../../product/product.dto';
import { User } from '../../user/user.dto';
import { Category } from 'src/category/category.dto';
import { Message } from '../dto/message.dto';

const chance = new Chance();

export const user: User = {
  id: chance.guid(),
  username: chance.first(),
  password: chance.string(),
  email: chance.email(),
  roles: ['ADMIN'],
};
export const category: Category = {
  id: chance.guid(),
  categoryName: chance.string(),
  createdBy: user.id,
  updatedBy: user.id,
  createdAt: chance.date(),
  updatedAt: chance.date(),
};
export const product: Product = {
  id: chance.guid(),
  productName: chance.string(),
  productDescription: chance.string(),
  productStock: chance.integer({ min: 200, max: 500 }),
  productPrice: chance.integer({ min: 1, max: 20 }),
  category: category.id,
  createdBy: user.id,
  updatedBy: user.id,
  createdAt: chance.date(),
  updatedAt: chance.date(),
};
category.product = [product.id];
export const order: Order = {
  id: chance.guid(),
  status: chance.string(),
  orderedBy: user.id,
  orderedItem: [chance.guid()],
  totalPayment: chance.integer({ min: 1, max: 20 }),
  createdAt: chance.date(),
  updatedAt: chance.date(),
};
export const cart: Cart = {
  id: chance.guid(),
  quantity: chance.integer({ min: 1, max: 20 }),
  subTotal: chance.integer({ min: 1, max: 20 }),
  cartedBy: user.id,
  product: product.id,
  status: chance.bool(),
  createdAt: chance.date(),
  updatedAt: chance.date(),
};

user.createdProducts = [product];
user.updatedProducts = [product];
user.createdOrders = [order];
user.createdCarts = [cart];

export const message: Message = { message: 'Success' };
