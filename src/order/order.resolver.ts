import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Cart } from '../cart/cart.dto';
import { CartService } from '../cart/cart.service';
import { Ctx } from '../common/auth/ctx.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Message } from '../common/dto/message.dto';
import { Role } from '../common/roles/role.enum';
import { Roles } from '../common/roles/roles.decorator';
import { RolesGuard } from '../common/roles/roles.guard';
import { User } from '../user/user.dto';
import { UserService } from '../user/user.service';
import {
  Order,
  OrdersListInput,
  OrderWhereUniqueInput,
  UpdateOrderInput,
} from './order.dto';
import { OrderService } from './order.service';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly cartService: CartService,
  ) {}
  @ResolveField()
  async orderedBy(@Parent() order: Order) {
    return await this.userService.findUser({ id: order.orderedBy });
  }
  @ResolveField()
  async orderedItem(@Parent() order: Order) {
    return await this.cartService.findCarts({
      where: {
        order: order.id,
      },
    });
  }
  @ResolveField()
  async totalPayment(@Parent() order: Order) {
    const iteams: Cart[] = await this.cartService.findCarts({
      where: {
        order: order.id,
      },
    });
    return iteams.reduce((sum, current) => sum + current.subTotal, 0);
  }

  // Create order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Mutation(() => Order)
  async createOrder(@Ctx() user: User) {
    try {
      const result = await this.orderService.createOrder({
        orderedBy: user.id,
      });
      return result;
    } catch (e) {
      throw e;
    }
  }

  // Order list - admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => [Order])
  async findOrders(@Args('input') input: OrdersListInput) {
    return await this.orderService.findOrders(input);
  }

  // Order by unique id
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Query(() => Order)
  async findOrder(@Args('input') input: OrderWhereUniqueInput) {
    return await this.orderService.findOrder(input);
  }

  // Update order status - admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Order)
  async updateOrder(@Args('input') input: UpdateOrderInput) {
    return await this.orderService.updateOrder(input);
  }

  // Logged user previous order list
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Query(() => [Order])
  async listOrders(@Args('input') input: OrdersListInput, @Ctx() user: User) {
    return await this.orderService.findOrders({
      ...input,
      where: { orderedBy: user.id },
    });
  }

  // Delete order status - admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Message)
  async deleteOrder(@Args('input') input: OrderWhereUniqueInput) {
    return await this.orderService.deleteOrder(input);
  }
}
