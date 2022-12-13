import { Test, TestingModule } from '@nestjs/testing';
import { Chance } from 'chance';
import { ProductService } from '../product/product.service';
import { product, cart, user } from '../common/test/test.dto';
import { OrderService } from '../order/order.service';
import { UserService } from '../user/user.service';
import {
  CartsListInput,
  CartWhereUniqueInput,
  CreateUpdateCartInput,
  UpdateCartInput,
} from './cart.dto';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';

const chance = new Chance();

const createUpdateCartInput: CreateUpdateCartInput = {
  quantity: cart.quantity,
  product: product.id,
  userId: user.id,
};

describe('ItemResolver', () => {
  let resolver: CartResolver;
  const mockService = {
    createUpdateCart: jest.fn((data) => {
      cart.quantity = data.quantity;
      return cart;
    }),
    updateCart: jest.fn((data) => {
      if (cart.id === data.id) {
        cart.quantity = data.quantity;
        return cart;
      } else {
        return null;
      }
    }),
    findCarts: jest.fn().mockResolvedValue([cart]),
    findCart: jest.fn().mockResolvedValue(cart),
  };
  const mockProductService = {
    findProduct: jest.fn().mockReturnValue(product),
  };
  const mockUserService = {
    findUser: jest.fn().mockReturnValue(user),
  };
  const mockCategoryService = {
    findOrder: jest.fn().mockReturnValue(product),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartResolver,
        { provide: CartService, useValue: mockService },
        { provide: ProductService, useValue: mockProductService },
        { provide: UserService, useValue: mockUserService },
        { provide: OrderService, useValue: mockCategoryService },
      ],
    }).compile();

    resolver = module.get<CartResolver>(CartResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should be able to create/update/delete a cart', async () => {
    let result = await resolver.createUpdateCart(createUpdateCartInput, user);
    expect(result).toBeDefined();
    expect(result).toMatchObject(cart);

    createUpdateCartInput.quantity = chance.integer({ min: 1, max: 5 });
    result = await resolver.createUpdateCart(createUpdateCartInput, user);
    expect(result).toBeDefined();
    expect(result).toMatchObject(cart);

    createUpdateCartInput.quantity = 0;
    result = await resolver.createUpdateCart(createUpdateCartInput, user);
    expect(result).toBeDefined();
    expect(result).toMatchObject(cart);
    expect(createUpdateCartInput.quantity).toBe(cart.quantity);
  });

  it('should be able to update cart', async () => {
    const updateCartInput: UpdateCartInput = {
      id: cart.id,
      quantity: chance.integer({ min: 3, max: 10 }),
    };
    const result = await resolver.updateCart(updateCartInput);
    expect(result).toBeDefined();
    expect(result.quantity).toBe(updateCartInput.quantity);
  });

  it('should be able to list all carts for a user', async () => {
    const input: CartsListInput = {
      skip: 0,
      take: 10,
      cursor: {
        id: cart.id,
      },
    };
    const result = await resolver.findCarts(input, user);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(cart.id);
  });

  it('should be able to find one cart by unique parameters', async () => {
    const input: CartWhereUniqueInput = {
      id: cart.id,
    };
    const result = await resolver.findCart(input);
    expect(result).toBeDefined();
    expect(result.quantity).toBe(cart.quantity);
  });

  it('should be able to list all carts for admin', async () => {
    const input: CartsListInput = {
      skip: 0,
      take: 10,
      cursor: {
        id: cart.id,
      },
    };
    const result = await resolver.findCartsAdmin(input);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(cart.id);
  });
});
