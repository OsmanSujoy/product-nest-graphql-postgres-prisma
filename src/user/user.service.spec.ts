import { Test, TestingModule } from '@nestjs/testing';
import Chance from 'chance';
import { AuthService } from '../common/auth/services/auth.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginUserInput, CreateUserInput, UpdateUserInput } from './user.dto';
import { UserService } from './user.service';

import { user, product, order, cart, message } from '../common/test/test.dto';

const chance = new Chance();

type CreateUserOutput = Omit<CreateUserInput, 'password'>;

const createUserInput: CreateUserInput = {
  username: user.username,
  password: user.password,
  email: user.email,
};

const createUserOutput: CreateUserOutput = {
  username: user.username,
  email: user.email,
};

describe('UserService', () => {
  let service: UserService;

  const mockPrisma = {
    user: {
      create: jest.fn().mockReturnValueOnce(createUserOutput),
      findFirst: jest.fn((data) => {
        if (
          data.where.OR[0].uesrname == createUserInput.username ||
          data.where.OR[1].email == createUserInput.email
        ) {
          return createUserInput;
        } else {
          return null;
        }
      }),
      findMany: jest.fn((data) => {
        if (
          data.where &&
          ((data.where.id && data.where.id == user.id) ||
            (data.where.email && data.where.email == user.email) ||
            (data.where.username && data.where.username == user.username))
        ) {
          return [user];
        }
        if (
          data.cursor &&
          ((data.cursor.id && data.cursor.id == user.id) ||
            (data.cursor.email && data.cursor.email == user.email) ||
            (data.cursor.username && data.cursor.username == user.username))
        ) {
          return [user];
        } else {
          return [];
        }
      }),
      findUnique: jest.fn((data) => {
        if (
          data.where.id == user.id ||
          data.where.email == user.email ||
          data.where.username == user.username
        ) {
          return user;
        } else {
          return null;
        }
      }),
      update: jest.fn().mockResolvedValue(createUserInput),
      delete: jest.fn().mockResolvedValue((data) => {
        if (
          data.where.id == user.id ||
          data.where.email == createUserOutput.email ||
          data.where.username == createUserOutput.username
        ) {
          return createUserOutput;
        } else {
          return null;
        }
      }),
    },
    product: {
      findMany: jest.fn((data) => {
        if (
          data.where &&
          data.where.createdBy &&
          data.where.createdBy == product.createdBy
        ) {
          return [product];
        } else if (
          data.where &&
          data.where.updatedBy &&
          data.where.updatedBy == product.updatedBy
        ) {
          return [product];
        } else {
          return [];
        }
      }),
    },
    order: {
      findMany: jest.fn((data) => {
        if (
          data.where &&
          data.where.orderedBy &&
          data.where.orderedBy == order.orderedBy
        ) {
          return [order];
        } else {
          return [];
        }
      }),
    },
    cart: {
      findMany: jest.fn((data) => {
        if (
          data.where &&
          data.where.cartedBy &&
          data.where.cartedBy == cart.cartedBy
        ) {
          return [cart];
        } else {
          return [];
        }
      }),
    },
  };

  const mockAuth = {
    verifyPassword: jest.fn((data) => {
      if (data.password == data.candidatePassword) {
        return true;
      } else {
        return false;
      }
    }),
    generateUserCredentials: jest.fn(() => {
      return { access_token: '' };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: AuthService,
          useValue: mockAuth,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an user with createUserInput', async () => {
    const result = await service.createUser(createUserInput);
    expect(result).toMatchObject(createUserOutput);
  });

  it('should be able to generate an access token', async () => {
    const loginUserInput: LoginUserInput = {
      usernameOrEmail: createUserInput.email,
      password: createUserInput.password,
    };
    const access_token = await service.loginUser(loginUserInput);
    expect(access_token).toBeDefined();
  });

  it('should not be able to generate an access token with valid credential', async () => {
    const loginUserInput: LoginUserInput = {
      usernameOrEmail: chance.email(),
      password: createUserInput.password,
    };
    try {
      await service.loginUser(loginUserInput);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to update some user properties', async () => {
    const updateUserInput: UpdateUserInput = {
      password: chance.string({ length: 15 }),
    };
    const result = await service.updateUser(user.id, updateUserInput);
    expect(result).toBeDefined();
    expect(result.email).toBe(createUserOutput.email);
  });

  it('should be able to update user role properties', async () => {
    let result = await service.updateUserRole({
      id: user.id,
      roles: user.roles[0],
    });
    expect(result).toBeDefined();
    expect(result.email).toBe(createUserOutput.email);

    result = await service.updateUserRole({
      email: createUserInput.email,
      roles: user.roles[0],
    });
    expect(result).toBeDefined();
    expect(result.email).toBe(createUserOutput.email);

    result = await service.updateUserRole({
      username: createUserInput.username,
      roles: user.roles[0],
    });
    expect(result).toBeDefined();
    expect(result.email).toBe(createUserOutput.email);
  });

  it('should not be enable to update user role properties', async () => {
    try {
      await service.updateUserRole({
        id: user.id,
        roles: 'Custom',
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }

    try {
      await service.updateUserRole({
        id: chance.guid(),
        roles: 'SUPERUSER',
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }

    try {
      await service.updateUserRole({
        email: chance.email(),
        roles: 'Custom',
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }

    try {
      await service.updateUserRole({
        username: chance.first(),
        roles: 'Custom',
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(400);
    }
  });

  it('should be able to find one by email or username', async () => {
    const result = await service.findUserByEmailOrUsername(user.email);
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
  });

  it('should not be able to find one by email or username', async () => {
    try {
      await service.findUserByEmailOrUsername(chance.email());
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find one by unique parameter', async () => {
    let result = await service.findUser({ id: user.id });
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
    result = await service.findUser({ email: user.email });
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
    result = await service.findUser({ username: user.username });
    expect(result).toBeDefined();
    expect(result.username).toBe(user.username);
  });

  it('should not be able to find one by unique parameter', async () => {
    try {
      await service.findUser({ id: chance.guid() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
    try {
      await service.findUser({ email: chance.email() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
    try {
      await service.findUser({ username: chance.first() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find user list by different parameters', async () => {
    let userList = await service.findUsers({
      skip: 0,
      take: 10,
      cursor: {
        id: user.id,
      },
    });
    expect(userList).toBeDefined();
    expect(userList).toHaveLength(1);
    expect(userList[0]).toMatchObject(user);
    expect(userList[0]).toHaveProperty('username', user.username);

    userList = await service.findUsers({
      skip: 0,
      take: 10,
      cursor: {
        username: createUserInput.username,
      },
    });
    expect(userList).toBeDefined();
    expect(userList).toHaveLength(1);
    expect(userList[0]).toMatchObject(user);
    expect(userList[0]).toHaveProperty('username', user.username);

    userList = await service.findUsers({
      skip: 0,
      take: 10,
      where: {
        email: createUserInput.email,
      },
    });
    expect(userList).toBeDefined();
    expect(userList).toHaveLength(1);
    expect(userList[0]).toEqual(user);
    expect(userList[0]).toHaveProperty('username', user.username);
  });

  it('should be not able to find user list by different parameters', async () => {
    try {
      await service.findUsers({
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
      await service.findUsers({
        skip: 0,
        take: 10,
        cursor: {
          username: chance.first(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }

    try {
      await service.findUsers({
        skip: 0,
        take: 10,
        where: {
          email: chance.email(),
        },
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to delete one by unique parameter', async () => {
    let result = await service.deleteUser({ id: user.id });
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
    result = await service.deleteUser({ email: createUserInput.email });
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
    result = await service.deleteUser({ username: createUserInput.username });
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });

  it('should not be able to delete one by unique parameter', async () => {
    try {
      await service.deleteUser({ id: chance.guid() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
    try {
      await service.deleteUser({ email: chance.email() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
    try {
      await service.deleteUser({ username: chance.first() });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find products thet is created by a user using id', async () => {
    const result = await service.findProductCreatedByUser(user.id);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe(product.productName);
  });

  it('should not be able to find products thet is created by a user using id', async () => {
    try {
      await service.findProductCreatedByUser(chance.guid());
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find products thet is updated by a user using id', async () => {
    const result = await service.findProductUpdatedByUserId(user.id);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe(product.productName);
  });

  it('should not be able to find products thet is updated by a user using id', async () => {
    try {
      await service.findProductUpdatedByUserId(chance.guid());
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find orders thet is created by a user using id', async () => {
    const result = await service.findOrdersByUserId(user.id);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(order.status);
  });

  it('should not be able to find orders thet is created by a user using id', async () => {
    try {
      await service.findOrdersByUserId(chance.guid());
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });

  it('should be able to find carted iteams thet is created by a user using id', async () => {
    const result = await service.findCartItemsByUserId(user.id);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(cart.quantity);
  });

  it('should not be able to find carted iteams thet is created by a user using id', async () => {
    try {
      await service.findCartItemsByUserId(chance.guid());
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.response).toBeDefined();
      expect(err.response.statusCode).toBe(404);
    }
  });
});
