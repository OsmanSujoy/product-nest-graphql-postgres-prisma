import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { Cart } from '../cart/cart.dto';

import { User } from '../user/user.dto';

@ObjectType()
export class Order {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => String, { nullable: false })
  status: string;

  @Field(() => User, { nullable: false })
  orderedBy: string;

  @Field(() => [Cart])
  orderedItem: string[];

  @Field()
  totalPayment: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => String, { nullable: false })
  status: string;
}

// @InputType()
// export class IdOrderInput {
//   @Field({ nullable: false })
//   id: string;
// }

@InputType()
export class OrderWhereUniqueInput implements Prisma.OrderWhereUniqueInput {
  @Field(() => ID, { nullable: true })
  id: string;
}

@InputType()
export class OrdersListInput {
  @Field(() => Number, { nullable: true })
  skip?: number;

  @Field(() => Number, { nullable: true })
  take?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: Prisma.OrderWhereUniqueInput;

  @Field(() => GraphQLJSON, { nullable: true })
  where?: Prisma.OrderWhereInput;

  @Field(() => GraphQLJSON, { nullable: true })
  orderBy?: Prisma.OrderOrderByWithRelationInput;
}
