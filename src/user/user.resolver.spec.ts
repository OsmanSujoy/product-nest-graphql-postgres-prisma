import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import Chance from 'chance';
import { user, message } from '../common/test/test.dto';
import {
  LoginUserInput,
  CreateUserInput,
  UpdateUserInput,
  UsersListInput,
  UserWhereUniqueInput,
} from './user.dto';

const chance = new Chance();

type RegisterUserOutput = Omit<CreateUserInput, 'password'>;

const createUserInput: CreateUserInput = {
  username: user.username,
  password: user.password,
  email: user.email,
};

const createUserOutput: RegisterUserOutput = {
  username: user.username,
  email: user.email,
};

describe('UserResolver', () => {
  let resolver: UserResolver;

  const mockService = {
    createUser: jest.fn().mockReturnValueOnce(createUserOutput),
    updateUser: jest.fn((id, password) => {
      if (id === user.id) {
        user.password = password;
        return user;
      } else {
        return null;
      }
    }),
    updateUserRole: jest.fn((data) => {
      if (data.id === user.id) {
        return user;
      } else {
        return null;
      }
    }),
    findUsers: jest.fn((data) => {
      if (data.cursor.id === user.id) {
        return [user];
      } else {
        return [];
      }
    }),
    findUser: jest.fn((data) => {
      if (
        (data.id && data.id === user.id) ||
        (data.email && data.email === user.email) ||
        (data.username && data.username === user.username)
      ) {
        return user;
      } else {
        return null;
      }
    }),
    deleteUser: jest.fn((data) => {
      if (
        (data.id && data.id === user.id) ||
        (data.email && data.email === user.email) ||
        (data.username && data.username === user.username)
      ) {
        return message;
      } else {
        return null;
      }
    }),
    loginUser: jest.fn((data) => {
      if (
        (data.usernameOrEmail == user.username ||
          data.usernameOrEmail == user.email) &&
        data.password == user.password
      ) {
        return chance.string();
      } else {
        return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should be able to create an user', async () => {
    const result = await resolver.createUser(createUserInput);
    expect(result).toBeDefined();
    expect(result).toMatchObject(createUserOutput);
  });

  it('should be able to update user', async () => {
    const updateUserInput: UpdateUserInput = {
      password: chance.string({ length: 15 }),
    };
    const result = await resolver.updateUser(updateUserInput, user);
    expect(result).toBeDefined();
    expect(result.username).toBe(user.username);
  });

  it('should be able to update role of user by ADMIN & MODERATOR', async () => {
    const result = await resolver.updateUserRole({
      id: user.id,
      roles: user.roles[0],
    });
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
  });

  it('should be able to list all users', async () => {
    const input: UsersListInput = {
      skip: 0,
      take: 10,
      cursor: {
        id: user.id,
      },
    };
    const result = await resolver.findUsers(input);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(user.id);
  });

  it('should be able to find one user by unique parameters', async () => {
    let input: UserWhereUniqueInput = {
      id: user.id,
    };
    let result = await resolver.findUser(input);
    expect(result).toBeDefined();
    expect(result.username).toBe(user.username);
    input = {
      email: user.email,
    };
    result = await resolver.findUser(input);
    expect(result).toBeDefined();
    expect(result.username).toBe(user.username);
  });

  it('should be able to delete a user ', async () => {
    const input: UserWhereUniqueInput = {
      id: user.id,
    };
    const result = await resolver.deleteUser(input);
    expect(result).toBeDefined();
    expect(result).toEqual(message);
    expect(result).toHaveProperty('message', message.message);
  });

  it('should be able generate an access token', async () => {
    const loginUserInput: LoginUserInput = {
      usernameOrEmail: user.email,
      password: user.password,
    };
    const access_token = await resolver.login(loginUserInput);
    expect(access_token).toBeDefined();
  });
});
