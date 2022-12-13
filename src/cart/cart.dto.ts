import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { Order } from '../order/order.dto';
import { Product } from '../product/product.dto';
import { User } from '../user/user.dto';
import { Min } from 'class-validator';

@ObjectType()
export class Cart {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => Number, { nullable: false })
  quantity: number;

  @Field(() => Number, { nullable: false })
  subTotal: number;

  @Field(() => User, { nullable: false })
  cartedBy: string;

  @Field(() => Product, { nullable: false })
  product: string;

  @Field(() => Order, { nullable: true })
  order?: string;

  @Field(() => Boolean)
  status: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateUpdateCartInput {
  @Field({ nullable: false })
  @Min(0)
  quantity: number;

  @Field({ nullable: false })
  product: string;

  userId: string;
}

@InputType()
export class UpdateCartInput {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => Number, { nullable: false })
  @Min(0)
  quantity: number;
}

@InputType()
export class CartWhereUniqueInput implements Prisma.CartWhereUniqueInput {
  @Field(() => ID, { nullable: true })
  id?: string;
}

@InputType()
export class CartsListInput {
  @Field(() => Number, { nullable: true })
  skip?: number;

  @Field(() => Number, { nullable: true })
  take?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: Prisma.CartWhereUniqueInput;

  @Field(() => GraphQLJSON, { nullable: true })
  where?: Prisma.CartWhereInput;

  @Field(() => GraphQLJSON, { nullable: true })
  orderBy?: Prisma.CartOrderByWithRelationInput;
}
