import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";

const loginError: UserResponse = {
  errors: [
    {
      message: "Invalid username or pasword.",
      field: "username",
    },
  ],
};
const noUserError: UserResponse = {
  errors: [{ message: "User ID not found.", field: "_id" }],
};
const notLoggedInError: UserResponse = {
  errors: [{ message: "You are not logged in.", field: "_id" }],
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
    @Ctx() { em, req }: EntityManagerContext
  ): Promise<UserResponse> {
    if (registerInfo.username.length <= 2) {
      return {
        errors: [
          {
            message: "Username must have at least 3 characters.",
            field: "username",
          },
        ],
      };
    }

    if (registerInfo.password.length <= 4) {
      return {
        errors: [
          {
            message: "Password must have at least 5 characters.",
            field: "password",
          },
        ],
      };
    }

    // Check if username is taken.
    const taken = await em.findOne(User, { username: registerInfo.username });
    if (taken)
      return {
        errors: [{ message: "Username is already taken.", field: "username" }],
      };

    const hashedPassword = await hash(registerInfo.password);

    const user = new User(registerInfo.username, hashedPassword);

    await em.persistAndFlush(user);

    // Login user
    req.session.userId = user.id;

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
