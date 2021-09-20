import { Request, Response } from "express";
import Redis from "ioredis";

export type RegularContext = {
  req: Request;
  res: Response;
  redis: Redis.Redis;
};
