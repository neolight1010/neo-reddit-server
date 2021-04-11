import { Post } from "../entities/Post";
import { EntityManagerContext } from "../types";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: EntityManagerContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
