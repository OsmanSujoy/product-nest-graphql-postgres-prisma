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
import { CategoryService } from './category.service';
import {
  CategoriesListInput,
  Category,
  CategoryWhereUniqueInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.dto';
import { Ctx } from '../common/auth/ctx.decorator';
import { User } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { Message } from '../common/dto/message.dto';
import { ProductService } from '../product/product.service';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}
  @ResolveField()
  async product(@Parent() category: Category) {
    return await this.productService.findProducts({
      where: { categoryId: category.id },
    });
  }
  @ResolveField()
  async createdBy(@Parent() category: Category) {
    return this.userService.findUser({ id: category.createdBy });
  }
  @ResolveField()
  async updatedBy(@Parent() category: Category) {
    return await this.userService.findUser({ id: category.updatedBy });
  }

  // Create category
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Category)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @Ctx() user: User,
  ) {
    try {
      const result = await this.categoryService.createCategory({
        ...input,
        userId: user.id,
      });
      return result;
    } catch (e) {
      throw e;
    }
  }

  //Category update by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Category)
  async updateCategory(
    @Args('input') input: UpdateCategoryInput,
    @Ctx() user: User,
  ) {
    return await this.categoryService.updateCategory({
      input,
      userId: user.id,
    });
  }

  //Category list
  @Query(() => [Category])
  async findCategories(@Args('input') input: CategoriesListInput) {
    return this.categoryService.findCategories(input);
  }

  //Category by ID
  @Query(() => Category)
  async findCategory(@Args('input') input: CategoryWhereUniqueInput) {
    return await this.categoryService.findCategory(input);
  }

  //Category delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation(() => Message)
  async deleteCategory(@Args('input') input: CategoryWhereUniqueInput) {
    return await this.categoryService.deleteCategory(input);
  }
}
