import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { RegularContext } from "../types";
import { User } from "../entities/User";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { LessThan } from "typeorm";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(
    /**The limit will be capped at 50.*/
    @Arg("limit", () => Int, { nullable: true }) limit?: number,
    /**All posts fetched will be older than the cursor's date.*/
    @Arg("cursor", () => Date, { nullable: true }) cursor?: Date
  ): Promise<Post[]> {
    limit = limit ? Math.min(limit, 50) : 50;

    return await Post.find({
      where: cursor
        ? {
            createdAt: LessThan(cursor),
          }
        : undefined,
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  @UseMiddleware(isLoggedIn)
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: RegularContext
  ): Promise<Post> {
    const user = await User.findOne(req.session.userId);

    const post = new Post(title, text, user!);
    return await post.save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) return null;

    await Post.update({ id }, { title });

    return post;
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Post.delete({ id });
    return true;
  }
}
