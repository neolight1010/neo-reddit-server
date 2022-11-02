import { Request, Response } from "express";
import Redis from "ioredis";
import { createUserLoader } from "./loaders/userLoader";
import { createVotesFromPostsLoader } from "./loaders/votesLoader";

export type RegularContext = {
  req: Request;
  res: Response;
  redis: Redis.Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  votesLoader: ReturnType<typeof createVotesFromPostsLoader>;
};
