import { UseGuards, forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Ctx } from '../common/auth/ctx.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Role } from '../common/roles/role.enum';
import { Roles } from '../common/roles/roles.decorator';
import { RolesGuard } from '../common/roles/roles.guard';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { User } from '../user/user.dto';
import { UserService } from '../user/user.service';
import {
  Cart,
  CartsListInput,
  UpdateCartInput,
  CreateUpdateCartInput,
  CartWhereUniqueInput,
} from './cart.dto';
import { CartService } from './cart.service';

@Resolver(() => Cart)
export class CartResolver {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}
  @ResolveField()
  async cartedBy(@Parent() cart: Cart) {
    return this.userService.findUser({ id: cart.cartedBy });
  }
  @ResolveField()
  async product(@Parent() cart: Cart) {
    return await this.productService.findProduct({ id: cart.product });
  }
  @ResolveField()
  async order(@Parent() cart: Cart) {
    return await this.orderService.findOrder({ id: cart.order });
  }

  // Add/remove/update iteams to cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Mutation(() => Cart)
  async createUpdateCart(
    @Args('input') input: CreateUpdateCartInput,
    @Ctx() user: User,
  ) {
    try {
      return await this.cartService.createUpdateCart({
        ...input,
        userId: user.id,
      });
    } catch (e) {
      throw e;
    }
  }
  // items in a single cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => Cart)
  async findCart(@Args('input') input: CartWhereUniqueInput) {
    return await this.cartService.findCart(input);
  }

  // list of carted items
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Query(() => [Cart])
  async findCarts(@Args('input') input: CartsListInput, @Ctx() user: User) {
    return await this.cartService.findCarts({
      ...input,
      where: {
        cartedBy: user.id,
        status: false,
      },
    });
  }

  // all users carts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => [Cart])
  async findCartsAdmin(@Args('input') input: CartsListInput) {
    return await this.cartService.findCarts(input);
  }

  // update a cart
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Cart)
  async updateCart(@Args('input') input: UpdateCartInput) {
    return await this.cartService.updateCart(input);
  }
}
