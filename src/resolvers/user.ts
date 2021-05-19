import { hash } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { em }: EntityManagerContext
  ) {
    const hashedPassword = await hash(password);

    const user = new User(username, hashedPassword);
    await em.persistAndFlush(user);

    return user;
  }
}
