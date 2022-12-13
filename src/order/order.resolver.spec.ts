import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../cart/cart.service';
import { message, order, user } from '../common/test/test.dto';
import { UserService } from '../user/user.service';
import {
  OrdersListInput,
  OrderWhereUniqueInput,
  UpdateOrderInput,
} from './order.dto';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

describe('OrderResolver', () => {
  let resolver: OrderResolver;
  const mockService = {
    createOrder: jest.fn().mockReturnValue(order),
    updateOrder: jest.fn((data) => {
      if (order.id === data.id) {
        order.status = data.status;
        return order;
      } else {
        return null;
      }
    }),
    findOrders: jest.fn((data) => {
      if (data.cursor.id === order.id) {
        return [order];
      } else {
        return [];
      }
    }),
    findOrder: jest.fn((data) => {
      if (data.id && data.id === order.id) {
        return order;
      } else {
        return null;
      }
    }),
    deleteOrder: jest.fn((data) => {
      if (data.id && data.id === order.id) {
        return message;
      } else {
        return null;
      }
    }),
  };
  const mockUserService = {};
  const mockCartService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderResolver,
        {
          provide: OrderService,
          useValue: mockService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    resolver = module.get<OrderResolver>(OrderResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should be able to create an order', async () => {
    const result = await resolver.createOrder(user);
    expect(result).toBeDefined();
    expect(result).toMatchObject(order);
  });

  it('should be able to update order status', async () => {
    const updateOrderInput: UpdateOrderInput = {
      id: order.id,
      status: 'Accepted',
    };
    const result = await resolver.updateOrder(updateOrderInput);
    expect(result).toBeDefined();
    expect(result.status).toBe(order.status);
  });

  it('should be able to list all orders', async () => {
    const input: OrdersListInput = {
      skip: 0,
      take: 10,
      cursor: {
        id: order.id,
      },
    };
    const result = await resolver.findOrders(input);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(order.id);
  });

  it('should be able to find one order by unique parameters', async () => {
    const input: OrderWhereUniqueInput = {
      id: order.id,
    };
    const result = await resolver.findOrder(input);
    expect(result).toBeDefined();
    expect(result.status).toBe(order.status);
  });

  it('should be able to delete a order ', async () => {
    const input: OrderWhereUniqueInput = {
      id: order.id,
    };
    const result = await resolver.deleteOrder(input);
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });
});
