import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { Product } from '../product/product.dto';
import { User } from '../user/user.dto';

@ObjectType()
export class Category {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => ID, { nullable: false })
  categoryName: string;

  @Field(() => [Product], { nullable: true })
  product?: string[];

  @Field(() => User, { nullable: false })
  createdBy: string;

  @Field(() => User, { nullable: false })
  updatedBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateCategoryInput {
  @Field(() => ID, { nullable: false })
  categoryName: string;

  userId: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => String, { nullable: false })
  categoryName: string;
}

@InputType()
export class CategoryWhereUniqueInput
  implements Prisma.CategoryWhereUniqueInput
{
  @Field(() => ID, { nullable: true })
  id: string;
}

@InputType()
export class CategoriesListInput {
  @Field(() => Number, { nullable: true })
  skip?: number;

  @Field(() => Number, { nullable: true })
  take?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: Prisma.CategoryWhereUniqueInput;

  @Field(() => GraphQLJSON, { nullable: true })
  where?: Prisma.CategoryWhereInput;

  @Field(() => GraphQLJSON, { nullable: true })
  orderBy?: Prisma.CategoryOrderByWithRelationInput;
}
