import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";

const loginError: UserResponse = {
  error: {
    message: "Invalid username or pasword.",
    fields: ["username", "password"],
  },
};
const noUserError: UserResponse = { error: { message: "User ID not found." } };
const notLoggedInError: UserResponse = {
  error: { message: "You are not logged in." },
};

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

@Resolver()
export class UserResolver {
  @Query(() => UserResponse)
  async me(@Ctx() { em, req }: EntityManagerContext): Promise<UserResponse> {
    if (req.session.userId) {
      const user = await em.findOne(User, { id: req.session.userId });

      if (user) return { user };
      return noUserError;
    }

    return notLoggedInError;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("registerInfo") registerInfo: UsernamePasswordInput,
    @Ctx() { em }: EntityManagerContext
  ): Promise<UserResponse> {
    if (registerInfo.username.length <= 2) {
      return {
        error: {
          message: "Username must have at least 3 characters.",
          fields: ["username"],
        },
      };
    }

    if (registerInfo.password.length <= 4) {
      return {
        error: {
          message: "Password must have at least 5 characters.",
          fields: ["password"],
        },
      };
    }

    // Check if username is taken.
    const taken = await em.findOne(User, { username: registerInfo.username });
    if (taken)
      return {
        error: { message: "Username is already taken.", fields: ["username"] },
      };

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
