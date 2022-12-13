import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthService } from '../common/auth/services/auth.service';
import {
  LoginUserInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateRoleUserInput,
  UserWhereUniqueInput,
  UsersListInput,
} from './user.dto';
import { User, Role } from '@prisma/client';
import { Message } from 'src/common/dto/message.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  // Create user
  async createUser(input: CreateUserInput) {
    try {
      // hash the password
      const saltOrRounds = 10;
      const password = await bcrypt.hash(input.password, saltOrRounds);

      return this.prisma.user.create({
        data: {
          ...input,
          email: input.email.toLowerCase(),
          username: input.username.toLowerCase(),
          password,
        },
      });
    } catch (error) {
      return await this.prisma.prismaErrors(error);
    }
  }

  // login user
  async loginUser(input: LoginUserInput) {
    try {
      const user = await this.findUserByEmailOrUsername(
        input.usernameOrEmail.toLowerCase(),
      );
      const isValid = await this.authService.verifyPassword({
        password: user.password,
        candidatePassword: input.password,
      });
      if (!isValid) {
        throw new BadRequestException();
      }
      return await this.authService.generateUserCredentials(user);
    } catch (error) {
      throw new BadRequestException(`Email or password are invalid`);
    }
  }

  // update user
  async updateUser(id: string, input: UpdateUserInput) {
    // await this.findUserById({ id });
    await this.findUser({ id });
    try {
      // hash the password
      const saltOrRounds = 10;
      input.password = await bcrypt.hash(input.password, saltOrRounds);
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...input,
        },
      });
    } catch (error) {
      // throw new BadRequestException(`Operation failed`);
      await this.prisma.prismaErrors(error);
    }
  }

  // update user - ADMIN & MODERATOR
  async updateUserRole({ id, email, username, roles }: UpdateRoleUserInput) {
    // await this.findUserById({ id });
    await this.findUser({ id, email, username });
    // Type 'string' is not assignable to type 'Role'
    let newRole: Role;
    if (roles == 'ADMIN') {
      newRole = 'ADMIN';
    } else if (roles == 'USER') {
      newRole = 'USER';
    } else {
      throw new BadRequestException('Unknown role');
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          roles: newRole,
        },
      });
    } catch (error) {
      await this.prisma.prismaErrors(error);
      // throw new BadRequestException(`Operation failed`);
    }
  }

  async findUserByEmailOrUsername(input: LoginUserInput['usernameOrEmail']) {
    const result = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: input }, { email: input }],
      },
    });
    if (result) {
      return result;
    }
    throw new NotFoundException(`Not found any user`);
  }

  // find user with unique parameters
  async findUser(where: UserWhereUniqueInput): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where,
    });
  }

  async findUsers(params: UsersListInput): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        createdProducts: true,
        updatedProducts: true,
      },
    });
  }

  async deleteUser(where: UserWhereUniqueInput) {
    try {
      const result = await this.prisma.user.delete({
        where,
      });
      if (result) {
        return { message: 'Success' } as Message;
      }
      throw new NotFoundException(`Not found any user`);
    } catch (error: any) {
      return await this.prisma.prismaErrors(error);
    }
  }

  // Field Resolvers
  async findProductCreatedByUser(userId: string) {
    return await this.prisma.product.findMany({
      where: {
        createdBy: userId,
      },
    });
  }

  async findProductUpdatedByUserId(userId: string) {
    return await this.prisma.product.findMany({
      where: {
        updatedBy: userId,
      },
    });
  }

  async findOrdersByUserId(userId: string) {
    return await this.prisma.order.findMany({
      where: {
        orderedBy: userId,
      },
    });
  }

  async findCartItemsByUserId(userId: string) {
    return await this.prisma.cart.findMany({
      where: {
        cartedBy: userId,
      },
    });
  }
}
