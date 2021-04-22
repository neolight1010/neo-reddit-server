import { Post } from "../entities/Post";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: EntityManagerContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: EntityManagerContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }
}
