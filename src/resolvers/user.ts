import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";

const loginError: UserResponse = { error: "Invalid username or pasword." };

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("registerInfo") registerInfo: UsernamePasswordInput,
    @Ctx() { em }: EntityManagerContext
  ) {
    const hashedPassword = await hash(registerInfo.password);

    const user = new User(registerInfo.username, hashedPassword);
    await em.persistAndFlush(user);

    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("loginInfo") loginInfo: UsernamePasswordInput,
    @Ctx() { em }: EntityManagerContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: loginInfo.username });

    if (!user) return loginError;

    const validPassword = await verify(user.password, loginInfo.password);
    if (validPassword) return { user };

    return loginError;
  }
}
