import { Test, TestingModule } from '@nestjs/testing';
import Chance from 'chance';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { cart, message, order, user } from '../common/test/test.dto';
import { OrderService } from './order.service';
import { UpdateOrderInput } from './order.dto';

const chance = new Chance();

describe('OrderService', () => {
  let service: OrderService;
  const mockPrisma = {
    order: {
      create: jest.fn().mockResolvedValue(order),
      update: jest.fn((data) => {
        if (data.where.id == order.id) {
          order.status = data.data.status;
          return order;
        } else {
          return null;
        }
      }),
      findFirst: jest.fn((data) => {
        if (data.where.id == order.id) {
          return order;
        } else {
          return null;
        }
      }),
      findMany: jest.fn((data) => {
        if (
          data.where &&
          data.where.status &&
          data.where.status == order.status
        ) {
          return [order];
        }
        if (data.cursor && data.cursor.id && data.cursor.id == order.id) {
          return [order];
        } else {
          return [];
        }
      }),
      delete: jest.fn().mockResolvedValue((data) => {
        if (data.where.id == order.id) {
          return message;
        } else {
          return null;
        }
      }),
    },
    cart: { updateMany: jest.fn().mockResolvedValue([]) },
  };
  const mockCartService = { findCarts: jest.fn().mockResolvedValue([cart]) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an order ', async () => {
    const result = await service.createOrder({ orderedBy: user.id });
    expect(result).toBeDefined();
    expect(result).toMatchObject(order);
  });

  it('should not able to create an order ', async () => {
    try {
      mockCartService.findCarts.mockImplementationOnce(() => []);
      await service.createOrder({ orderedBy: user.id });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to update order status', async () => {
    const updateOrderInput: UpdateOrderInput = {
      id: order.id,
      status: 'Accepted',
    };
    const result = await service.updateOrder(updateOrderInput);
    expect(result).toBeDefined();
    expect(result.status).toBe(updateOrderInput.status);
  });

  it('should not be able to update order status', async () => {
    try {
      const updateOrderInput: UpdateOrderInput = {
        id: order.id,
        status: chance.string(),
      };
      await service.updateOrder(updateOrderInput);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to find one by unique parameter', async () => {
    const result = await service.findOrder({ id: order.id });
    expect(result).toBeDefined();
    expect(result.status).toBe(order.status);
  });

  it('should be able to find order list by different parameters', async () => {
    let ordersList = await service.findOrders({
      skip: 0,
      take: 10,
      cursor: {
        id: order.id,
      },
    });
    expect(ordersList).toBeDefined();
    expect(ordersList).toHaveLength(1);
    expect(ordersList[0]).toMatchObject(order);
    expect(ordersList[0]).toHaveProperty('status', order.status);

    ordersList = await service.findOrders({
      skip: 0,
      take: 10,
      where: {
        status: order.status,
      },
    });
    expect(ordersList).toBeDefined();
    expect(ordersList).toHaveLength(1);
    expect(ordersList[0]).toEqual(order);
    expect(ordersList[0]).toHaveProperty('status', order.status);
  });

  it('should be not able to find orders list by different parameters', async () => {
    try {
      await service.findOrders({
        skip: 0,
        take: 10,
        cursor: {
          id: chance.guid(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }

    try {
      await service.findOrders({
        skip: 0,
        take: 10,
        where: {
          status: chance.string(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to delete one by unique parameter', async () => {
    const result = await service.deleteOrder({ id: order.id });
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });

  it('should not be able to delete one by unique parameter', async () => {
    try {
      await service.deleteOrder({ id: chance.guid() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });
});
