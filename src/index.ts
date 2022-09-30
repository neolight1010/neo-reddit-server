import "reflect-metadata";
import {
  CORS_ORIGIN,
  __dbUrl__,
  __port__,
  __prod__,
  __redisUrl__,
  __sessionCookie__,
  __sessionSecret__,
} from "./constants";
import express from "express";
import { Post } from "./entities/Post";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";
import { RegularContext } from "./types";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { join } from "path";
import { Vote } from "./entities/Vote";
import { createUserLoader } from "./loaders/userLoader";
import { createVotesFromPostsLoader } from "./loaders/votesLoader";

async function main() {
  const app = express();

  // Set up ExpressSession and Redis.
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(__redisUrl__);

  app.set("trust proxy", 1);

  app.use(
    session({
      name: __sessionCookie__,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 5 * 30 * 24 * 60 * 60 * 1000,
        httpOnly: __prod__,
        secure: __prod__,
        sameSite: "lax",
      }, // 5 months.
      saveUninitialized: false,
      secret: __sessionSecret__!,
      resave: false,
    })
  );

  // Set up TypeORM
  const conn = await createConnection({
    type: "postgres",
    url: __dbUrl__,
    logging: true,
    synchronize: false,
    entities: [User, Post, Vote],
    migrations: [join(__dirname, "migrations", "*")],
  });

  await conn.runMigrations();

  // Set up ApolloServer.
  const apolloServer = new ApolloServer({
    playground: { settings: { "request.credentials": "include" } },
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): RegularContext => ({
      req,
      res,
      redis: redisClient,
      userLoader: createUserLoader(),
      votesLoader: createVotesFromPostsLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: CORS_ORIGIN,
    },
  });

  app.listen(__port__, () => {
    console.log(`Server started on port ${__port__}`);
  });
}

main().catch((e) => console.log(e));
