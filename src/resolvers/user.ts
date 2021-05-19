import { hash } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../input_types";

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
}
