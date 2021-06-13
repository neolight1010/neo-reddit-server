import { Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";

@ObjectType()
export class FieldError {
  @Field(() => String)
  message: string;

  @Field(() => [String])
  fields?: string[];
}

@ObjectType()
export class UserResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;

  @Field(() => User, { nullable: true })
  user?: User;
}
