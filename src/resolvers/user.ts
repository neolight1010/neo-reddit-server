import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";
import { FORGOT_PASSWORD_PREFIX, __sessionCookie__ } from "../constants";
import validateRegister from "../utils/validateRegister";
import sendEmail from "../utils/sendEmail";
import { v4 } from "uuid";
import validatePassword from "../utils/validatePassword";

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

  /**
   * Sends an email with a link to reset account password.
   * Returns true if the email was sent.
   *
   * If the email was not sent, it may be because the given
   * email doesn't exist in the database.
   */
  @Mutation(() => Boolean, {
    description: "Returns true if the reset password email was sent.",
  })
  async forgotPassword(
    @Ctx() { em, redis }: EntityManagerContext,
    @Arg("email") email: string
  ): Promise<Boolean> {
    const user = await em.findOne(User, { email });
    if (!user) return false;

    const token = v4();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    const resetPasswordURL = `http://localhost:3000/change-password/${token}`;
    const anchorTag = `<a href=${resetPasswordURL}>Reset Password</a>`;

    await sendEmail({ to: email, html: anchorTag });

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, redis }: EntityManagerContext
  ): Promise<UserResponse> {
    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length > 0) {
      return {
        errors: passwordErrors,
      };
    }

    const tokenRedisKey = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(tokenRedisKey);
    if (!userId)
      return {
        errors: [
          {
            message: "Invalid token.",
            field: "token",
          },
        ],
      };

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user)
      return {
        errors: [
          {
            message: "User no longer exists.",
            field: "token",
          },
        ],
      };

    const hashedPassword = await hash(newPassword);
    user.password = hashedPassword;

    await em.persistAndFlush(user);
    await redis.del(tokenRedisKey);
    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("registerInfo") registerInfo: UsernamePasswordInput,
    @Ctx() { em, req }: EntityManagerContext
  ): Promise<UserResponse> {
    const errors = validateRegister(registerInfo);
    if (errors.length > 0) return { errors };

    // Check if username is taken.
    const usernameTaken = await em.findOne(User, {
      username: registerInfo.username,
    });
    if (usernameTaken)
      return {
        errors: [{ message: "Username is already taken.", field: "username" }],
      };

    // Check if username is taken.
    const emailTaken = await em.findOne(User, { email: registerInfo.email });
    if (emailTaken)
      return {
        errors: [{ message: "Email is already taken.", field: "email" }],
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
