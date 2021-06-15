import { Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";

@ObjectType()
export class FieldError {
  @Field(() => String)
  message: string;

  @Field(() => String)
  field: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}
