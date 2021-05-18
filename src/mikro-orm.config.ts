import { __dbName__, __dbUser__, __dbPassword__, __debug__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: __dbName__,
  user: __dbUser__,
  password: __dbPassword__,
  type: "postgresql",
  debug: __debug__,
} as Parameters<typeof MikroORM.init>[0];
