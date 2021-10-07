import { MiddlewareFn } from "type-graphql";
import { RegularContext } from "../types";

export const isLoggedIn: MiddlewareFn<RegularContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated.");
  }

  return next();
};
