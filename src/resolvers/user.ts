import { hash, verify } from "argon2";
import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";
import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";
import {
  CORS_ORIGIN,
  FORGOT_PASSWORD_PREFIX,
  __sessionCookie__,
} from "../constants";
import validateRegister from "../utils/validateRegister";
import sendEmail from "../utils/sendEmail";
import { v4 } from "uuid";
import validatePassword from "../utils/validatePassword";
import { RegularContext } from "../types";

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

@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
  @FieldResolver()
  async _postsField(@Root() user: User) {
    return await user.posts;
  }

  @FieldResolver()
  _emailField(@Root() user: User, @Ctx() { req }: RegularContext) {
    if (req.session.userId === user.id) return user.email;

    return "";
  }

  @Query(() => UserResponse)
  async me(@Ctx() { req }: RegularContext): Promise<UserResponse> {
    if (req.session.userId) {
      const user = await User.findOne(req.session.userId);

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
    @Ctx() { redis }: RegularContext,
    @Arg("email") email: string
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) return false;

    const token = v4();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    const resetPasswordURL = `${CORS_ORIGIN}/change-password/${token}`;
    const anchorTag = `<a href=${resetPasswordURL}>Reset Password</a>`;

    await sendEmail({ to: email, html: anchorTag });

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis }: RegularContext
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

    const userIdNumber = parseInt(userId);
    const user = await User.findOne(userIdNumber);

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

    await User.update({ id: userIdNumber }, { password: hashedPassword });

    await redis.del(tokenRedisKey);
    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("registerInfo") registerInfo: UsernamePasswordInput,
    @Ctx() { req }: RegularContext
  ): Promise<UserResponse> {
    const errors = validateRegister(registerInfo);
    if (errors.length > 0) return { errors };

    const { username, email, password } = registerInfo;

    // Check if username is taken.
    const usernameTaken = await User.findOne({ where: { username } });
    if (usernameTaken) {
      return {
        errors: [
          {
            message: "Username is already taken.",
            field: "username",
          },
        ],
      };
    }

    // Check if username is taken.
    const emailTaken = await User.findOne({ where: { email } });
    if (emailTaken)
      return {
        errors: [{ message: "Email is already taken.", field: "email" }],
      };

    const hashedPassword = await hash(password);

    const user = new User(
      registerInfo.username,
      registerInfo.email,
      hashedPassword
    );

    await user.save();

    // Login user
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { req }: RegularContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ username });

    if (!user) return loginError;

    const validPassword = await verify(user.password, password);
    if (validPassword) {
      req.session.userId = user.id;

      return { user };
    }

    return loginError;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: RegularContext): Promise<Boolean> {
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
