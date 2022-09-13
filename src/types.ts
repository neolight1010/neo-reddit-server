import { Request, Response } from "express";
import Redis from "ioredis";
import {createUserLoader} from "./loaders/userLoader";

export type RegularContext = {
  req: Request;
  res: Response;
  redis: Redis.Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
