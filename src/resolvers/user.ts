import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";

const loginError: UserResponse = { error: "Invalid username or pasword." };

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("registerInfo") registerInfo: UsernamePasswordInput,
    @Ctx() { em }: EntityManagerContext
  ): Promise<UserResponse> {
    if (registerInfo.username.length <= 2) {
      return { error: "Username must have at least 3 characters." };
    }

    if (registerInfo.password.length <= 4) {
      return { error: "Password must have at least 5 characters." };
    }

    // Check if username is taken.
    const taken = await em.findOne(User, { username: registerInfo.username });
    if (taken) return { error: "Username is already taken." };

    const hashedPassword = await hash(registerInfo.password);

    const user = new User(registerInfo.username, hashedPassword);

    await em.persistAndFlush(user);
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("loginInfo") loginInfo: UsernamePasswordInput,
    @Ctx() { em, req }: EntityManagerContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: loginInfo.username });

    if (!user) return loginError;

    const validPassword = await verify(user.password, loginInfo.password);
    if (validPassword) {
      req.session.userId = user.id;

      return { user };
    }

    return loginError;
  }
}
