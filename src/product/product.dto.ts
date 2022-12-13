import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { Min } from 'class-validator';
import { Category } from '../category/category.dto';
import { User } from '../user/user.dto';

@ObjectType()
export class Product {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => String, { nullable: false })
  productName: string;

  @Field(() => String)
  productDescription: string;

  @Field(() => Number, { nullable: false })
  productStock: number;

  @Field(() => Number, { nullable: false })
  productPrice: number;

  @Field(() => Category, { nullable: false })
  category: string;

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
export class CreateProductInput {
  @Field({ nullable: false })
  productName: string;

  @Field()
  productDescription: string;

  @Field()
  @Min(1)
  productStock: number;

  @Field({ nullable: false })
  @Min(0)
  productPrice: number;

  @Field({ nullable: false })
  category: string;

  userId: string;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: true })
  productName?: string;

  @Field({ nullable: true })
  productDescription?: string;

  // @Field()
  // productStock: number;

  @Field({ nullable: false })
  @Min(0)
  productPrice?: number;
}

@InputType()
export class ProductWhereUniqueInput implements Prisma.ProductWhereUniqueInput {
  @Field(() => ID, { nullable: true })
  id: string;
}

@InputType()
export class ProductsListInput {
  @Field(() => Number, { nullable: true })
  skip?: number;

  @Field(() => Number, { nullable: true })
  take?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: Prisma.ProductWhereUniqueInput;

  @Field(() => GraphQLJSON, { nullable: true })
  where?: Prisma.ProductWhereInput;

  @Field(() => GraphQLJSON, { nullable: true })
  orderBy?: Prisma.ProductOrderByWithRelationInput;
}
