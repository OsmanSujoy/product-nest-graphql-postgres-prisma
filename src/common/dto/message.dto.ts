import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => String)
  message: string;
}
