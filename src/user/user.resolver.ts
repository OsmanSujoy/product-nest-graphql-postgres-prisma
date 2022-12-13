import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles/roles.guard';
import { Roles } from '../common/roles/roles.decorator';
import { Role } from '../common/roles/role.enum';
import {
  Resolver,
  ResolveField,
  Parent,
  Mutation,
  Args,
  Query,
} from '@nestjs/graphql';
import {
  LoginUserInput,
  CreateUserInput,
  UpdateUserInput,
  UpdateRoleUserInput,
  User,
  UserWhereUniqueInput,
  UsersListInput,
} from './user.dto';
import { UserService } from './user.service';
import { Ctx } from '../common/auth/ctx.decorator';
import { Message } from '../common/dto/message.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @ResolveField()
  async createdProducts(@Parent() user: User) {
    const data = await this.userService.findProductCreatedByUser(user.id);
    if (data.length > 0) {
      return data;
    }
    return [];
  }

  @ResolveField()
  async updatedProducts(@Parent() user: User) {
    const data = await this.userService.findProductUpdatedByUserId(user.id);
    if (data.length > 0) {
      return data;
    }
    return [];
  }

  @ResolveField()
  async createdOrders(@Parent() user: User) {
    const data = await this.userService.findOrdersByUserId(user.id);
    if (data.length > 0) {
      return data;
    }
    return [];
  }

  @ResolveField()
  async createdCarts(@Parent() user: User) {
    const data = await this.userService.findCartItemsByUserId(user.id);
    if (data.length > 0) {
      return data;
    }
    return [];
  }

  //User create
  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput) {
    try {
      return await this.userService.createUser(input);
    } catch (error) {
      // check if violates unique constraint
      throw error;
    }
  }

  //User update
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Mutation(() => User)
  async updateUser(@Args('input') input: UpdateUserInput, @Ctx() user: User) {
    return await this.userService.updateUser(user.id, input);
  }

  //User Role update
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => User)
  async updateUserRole(@Args('input') input: UpdateRoleUserInput) {
    return await this.userService.updateUserRole(input);
  }

  //User profile
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Query(() => User)
  me(@Ctx() user: User) {
    return user;
  }

  //User list
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => [User])
  async findUsers(
    @Args('input')
    input: UsersListInput,
  ) {
    return await this.userService.findUsers(input);
  }

  //User by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => User)
  async findUser(@Args('input') input: UserWhereUniqueInput) {
    return this.userService.findUser(input);
  }

  //User delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Message)
  async deleteUser(@Args('input') input: UserWhereUniqueInput) {
    return this.userService.deleteUser(input);
  }

  //User login
  @Mutation(() => String)
  async login(@Args('input') input: LoginUserInput) {
    return this.userService.loginUser(input);
  }
}
