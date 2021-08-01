import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";
import { __sessionCookie__ } from "../constants";
import validateRegister from "../utils/validateRegister";

const loginError: UserResponse = {
  errors: [
    {
      message: "Invalid username or pasword.",
      field: "password",
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
    const validation = validateRegister(registerInfo);
    if (validation) return validation;

    // Check if username is taken.
    const taken = await em.findOne(User, { username: registerInfo.username });
    if (taken)
      return {
        errors: [{ message: "Username is already taken.", field: "username" }],
      };

    const hashedPassword = await hash(registerInfo.password);

    const user = new User(
      registerInfo.username,
      registerInfo.email,
      hashedPassword
    );

    await em.persistAndFlush(user);

    // Login user
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: EntityManagerContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: username });

    if (!user) return loginError;

    const validPassword = await verify(user.password, password);
    if (validPassword) {
      req.session.userId = user.id;

      return { user };
    }

    return loginError;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: EntityManagerContext): Promise<Boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (!err) {
          res.clearCookie(__sessionCookie__);
          resolve(true);
        }

        resolve(false);
      });
    });
  }
}
