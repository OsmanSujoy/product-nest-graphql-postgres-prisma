import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../common/prisma/prisma.service';
import Chance from 'chance';
import { CartService } from './cart.service';
import { CreateUpdateCartInput, UpdateCartInput } from './cart.dto';
import { cart, product, user } from '../common/test/test.dto';
import { ConfigService } from '@nestjs/config';
import { LogService } from '../common/logger/logger.service';

const chance = new Chance();

const createUpdateCartInput: CreateUpdateCartInput = {
  quantity: cart.quantity,
  product: cart.product,
  userId: user.id,
};

process.on('beforeExit', function () {
  setTimeout(function () {
    [];
  }, 1).unref();
});

describe('ItemService', () => {
  let service: CartService;
  const mockPrisma = {
    cart: {
      create: jest.fn().mockReturnValueOnce(cart),
      update: jest.fn((data) => {
        if (data.where.id == cart.id) {
          cart.quantity = data.data.quantity;
          return cart;
        } else {
          return null;
        }
      }),
      findMany: jest.fn().mockReturnValue([cart]),
      delete: jest.fn().mockReturnValue(cart),
      findFirst: jest.fn((data) => {
        if (data.where.id == cart.id) {
          return cart;
        } else {
          return null;
        }
      }),
    },
    product: {
      findUnique: jest.fn().mockReturnValue(product),
      update: jest.fn().mockReturnValue(product),
    },
  };
  const mockConfig = {
    get: jest.fn().mockReturnValue(1),
  };
  const mockLog = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
        {
          provide: LogService,
          useValue: mockLog,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    service.timeOut = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a cart with CreateCartInput', async () => {
    mockPrisma.cart.findMany.mockImplementationOnce(() => []);
    const result = await service.createUpdateCart(createUpdateCartInput);
    expect(result).toBeDefined();
    expect(result).toMatchObject(cart);
  });

  it('should update a cart', async () => {
    createUpdateCartInput.quantity = chance.integer({ min: 21, max: 30 });

    const result = await service.createUpdateCart(createUpdateCartInput);
    expect(result).toBeDefined();
    expect(result.quantity).toBe(createUpdateCartInput.quantity);
  });

  it('should delete a cart', async () => {
    createUpdateCartInput.quantity = 0;

    const result = await service.createUpdateCart(createUpdateCartInput);
    expect(result).toBeDefined();
    expect(result.quantity).toBe(createUpdateCartInput.quantity);
  });

  it('should not able to create/update/delete a cart with invalid quantity', async () => {
    try {
      createUpdateCartInput.quantity = -1;

      await service.createUpdateCart(createUpdateCartInput);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should not able to create/update/delete a cart with not available items', async () => {
    try {
      mockPrisma.product.findUnique.mockImplementationOnce(() => []);
      await service.createUpdateCart(createUpdateCartInput);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to update some cart properties', async () => {
    mockPrisma.cart.findMany.mockImplementationOnce(() => [
      { ...cart, productList: product },
    ]);
    const newQuantity = chance.integer({ min: 1, max: 3 });
    const updateCartInput: UpdateCartInput = {
      id: cart.id,
      quantity: newQuantity,
    };
    const result = await service.updateCart(updateCartInput);
    expect(result).toBeDefined();
    expect(result.quantity).toBe(newQuantity);
  });

  it('should not be able to update some product properties with invalid ID', async () => {
    mockPrisma.cart.findMany.mockImplementationOnce(() => [
      { ...cart, productList: product },
    ]);
    try {
      const updateCartInput: UpdateCartInput = {
        id: chance.guid(),
        quantity: chance.integer({ min: 5 }),
      };
      await service.updateCart(updateCartInput);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to find one by unique parameter', async () => {
    const result = await service.findCart({ id: cart.id });
    expect(result).toBeDefined();
    expect(result.quantity).toBe(cart.quantity);
  });

  it('should not be able to find one by invalid parameter', async () => {
    try {
      await service.findCart({ id: chance.guid() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find cart list by different parameters', async () => {
    let cartList = await service.findCarts({
      skip: 0,
      take: 10,
      cursor: {
        id: cart.id,
      },
    });
    expect(cartList).toBeDefined();
    expect(cartList).toHaveLength(1);
    expect(cartList[0]).toMatchObject(cart);
    expect(cartList[0]).toHaveProperty('subTotal', cart.subTotal);

    cartList = await service.findCarts({
      skip: 0,
      take: 10,
      where: {
        cartedBy: cart.cartedBy,
      },
    });
    expect(cartList).toBeDefined();
    expect(cartList).toHaveLength(1);
    expect(cartList[0]).toEqual(cart);
    expect(cartList[0]).toHaveProperty('cartedBy', cart.cartedBy);
  });

  it('should be not able to find cart list by different parameters', async () => {
    try {
      await service.findCarts({
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
      await service.findCarts({
        skip: 0,
        take: 10,
        where: {
          subTotal: chance.integer({ max: -1 }),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });
});
