import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles/roles.guard';
import { Roles } from '../common/roles/roles.decorator';
import { Role } from '../common/roles/role.enum';
import { ProductService } from './product.service';
import {
  CreateProductInput,
  ProductsListInput,
  Product,
  ProductWhereUniqueInput,
  UpdateProductInput,
} from './product.dto';
import { Ctx } from '../common/auth/ctx.decorator';
import { User } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { Message } from '../common/dto/message.dto';
import { CategoryService } from '../category/category.service';

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
  ) {}
  @ResolveField()
  async category(@Parent() product: Product) {
    return await this.categoryService.findCategory({
      id: product.category,
    });
  }
  @ResolveField()
  async createdBy(@Parent() product: Product) {
    return this.userService.findUser({ id: product.createdBy });
  }
  @ResolveField()
  async updatedBy(@Parent() product: Product) {
    return await this.userService.findUser({ id: product.updatedBy });
  }

  //Product create
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Product)
  async createProduct(
    @Args('input') input: CreateProductInput,
    @Ctx() user: User,
  ) {
    try {
      const result = await this.productService.createProduct({
        ...input,
        userId: user.id,
      });
      return result;
    } catch (e) {
      throw e;
    }
  }

  //Product update by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Product)
  async updateProduct(
    @Args('input') input: UpdateProductInput,
    @Ctx() user: User,
  ) {
    return await this.productService.updateProduct({
      input,
      userId: user.id,
    });
  }

  //Product list
  @Query(() => [Product])
  async findProducts(@Args('input') input: ProductsListInput) {
    return this.productService.findProducts(input);
  }

  //Product by ID
  @Query(() => Product)
  async findProduct(@Args('input') input: ProductWhereUniqueInput) {
    return await this.productService.findProduct(input);
  }

  //Product delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Message)
  async deleteProduct(@Args('input') input: ProductWhereUniqueInput) {
    return await this.productService.deleteProduct(input);
  }
}
