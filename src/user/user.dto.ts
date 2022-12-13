import { IsEmail, Length } from 'class-validator';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Product } from '../product/product.dto';
import { Order } from '../order/order.dto';
import { Cart } from '../cart/cart.dto';
import { Prisma } from '@prisma/client';

@ObjectType()
export class User {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => ID, { nullable: false })
  username: string;

  @Field(() => ID, { nullable: false })
  email: string;

  password: string;

  @Field(() => [String], { defaultValue: 'USER' })
  roles: string[];

  @Field(() => [Product])
  createdProducts?: Product[];

  @Field(() => [Product])
  updatedProducts?: Product[];

  @Field(() => [Order])
  createdOrders?: Order[];

  @Field(() => [Cart])
  createdCarts?: Cart[];
}

@InputType()
export class CreateUserInput implements Prisma.UserCreateInput {
  @Field({
    nullable: false,
  })
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(6, 56)
  password: string;
}

@InputType()
export class UpdateUserInput {
  @Field()
  @Length(6, 56)
  password: string;
}

@InputType()
export class LoginUserInput {
  @Field({
    nullable: false,
  })
  usernameOrEmail: string;

  @Field()
  @Length(6, 56)
  password: string;
}

@InputType()
export class UserWhereUniqueInput implements Prisma.UserWhereUniqueInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => ID, { nullable: true })
  username?: string;

  @Field(() => ID, { nullable: true })
  email?: string;
}

@InputType()
export class UpdateRoleUserInput extends UserWhereUniqueInput {
  @Field(() => String)
  roles: string;
}

@InputType()
export class UsersListInput {
  @Field(() => Number, { nullable: true })
  skip?: number;

  @Field(() => Number, { nullable: true })
  take?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: Prisma.UserWhereUniqueInput;

  @Field(() => GraphQLJSON, { nullable: true })
  where?: Prisma.UserWhereInput;

  @Field(() => GraphQLJSON, { nullable: true })
  orderBy?: Prisma.UserOrderByWithRelationInput;
}
