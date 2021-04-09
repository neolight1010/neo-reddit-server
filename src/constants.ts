export const __prod__ = process.env.NODE_ENV === "production";
export const __debug__ = !__prod__;

if (__debug__) {
  require("dotenv").config();
}

export const __dbName__ = process.env.DB_NAME;
export const __dbUser__ = process.env.DB_USER;
export const __dbPassword__ = process.env.DB_PASSWORD;
