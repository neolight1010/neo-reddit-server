import { Post } from "../entities/Post";
import { EntityManagerContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

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

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: EntityManagerContext
  ): Promise<Post> {
    const post = new Post((title = title));
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", { nullable: false }) title: string,
    @Ctx() { em }: EntityManagerContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });

    if (!post) return null;
    post.title = title;

    await em.flush();
    return post;
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: EntityManagerContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
