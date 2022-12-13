import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import Chance from 'chance';
import * as bcrypt from 'bcrypt';
import { user } from '../../test/test.dto';
import { UserService } from '../../../user/user.service';

const chance = new Chance();

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;
  const JWT_SECRET = chance.string({ length: 15 });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: JWT_SECRET })],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(async (email) => {
              if (email) {
                const saltOrRounds = 10;
                const passwordHash = await bcrypt.hash(
                  user.password,
                  saltOrRounds,
                );
                return { ...user, password: passwordHash };
              } else {
                return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('should validate user credentials', async () => {
  //   const isUserValid = await service.validateUser(user.email, user.password);
  //   expect(isUserValid).toBeDefined();
  //   expect(isUserValid.email).toBe(user.email);
  // });
  // it('should not validate user credentials', async () => {
  //   const isUserValid = await service.validateUser(null, user.password);
  //   expect(isUserValid).toBe(null);
  // });

  it('should be able to generate an access_token', async () => {
    const access_token = await service.generateUserCredentials(user);
    expect(access_token).toBeDefined();
    expect(typeof access_token).toBe('string');
  });
});
