export const __prod__ = process.env.NODE_ENV === "production";
export const __debug__ = !__prod__;

if (__debug__) {
  require("dotenv").config();
}

export const __port__ = process.env.PORT;

export const __dbUrl__ = process.env.DATABASE_URL;

export const __redisUrl__ = process.env.REDIS_URL;

export const __sessionSecret__ = process.env.SESSION_SECRET;
export const __sessionCookie__ = "qid";

export const CORS_ORIGIN = process.env.CORS_ORIGIN;

export const FORGOT_PASSWORD_PREFIX = "forgot-password:";
