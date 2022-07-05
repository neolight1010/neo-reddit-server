import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  ID,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  ResolverInterface,
  Root,
  UseMiddleware,
} from "type-graphql";
import { RegularContext } from "../types";
import { User } from "../entities/User";
import { isLoggedIn } from "../middleware/isLoggedIn";
import { LessThan } from "typeorm";
import {Vote, VoteDirection} from "../entities/Vote";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]

  @Field()
  hasMore: boolean;
}

@Resolver(() => Post)
export class PostResolver implements ResolverInterface<Post> {
  @FieldResolver()
  _textSnippetField(@Root() post: Post) {
    return post.text.slice(0, 47) + "...";
  }

  @FieldResolver()
  async _authorField(@Root() post: Post) {
    return await post.author;
  }

  @Query(() => PaginatedPosts)
  async posts(
    /**The limit will be capped at 50.*/
    @Arg("limit", () => Int, { nullable: true }) limit?: number,
    /**All posts fetched will be older than the cursor's date.*/
    @Arg("cursor", () => Date, { nullable: true }) cursor?: Date
  ): Promise<PaginatedPosts> {
    limit = limit ? Math.min(limit, 50) : 50;

    const posts = await Post.find({
      where: cursor
        ? {
            createdAt: LessThan(cursor),
          }
        : undefined,
      order: { createdAt: "DESC" },
      take: limit + 1, // Fetch one more post.
    });

    return {
      posts: posts.slice(0, limit), // Slice to get only what was requested.
      hasMore: posts.length === limit + 1,
    };
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

  /**
   * Performs a vote with the given direction and returns the new number of
   * points of the post.
   */
  @UseMiddleware(isLoggedIn)
  @Mutation(() => Int)
  async vote(
    @Arg("postId", () => ID) postId: string,
    @Arg("direction", () => VoteDirection) direction: VoteDirection,
    @Ctx() { req }: RegularContext
  ): Promise<number> {
    const { userId } = req.session;

    await Vote.insert({
      post: () => postId,
      user: () => userId!.toString(),
      direction,
    });

    const value = direction == VoteDirection.UP ? 1 : -1;

    const post = await Post.findOne(postId);

    if (post === undefined) {
      throw Error("Invalid postId");
    }

    const newPoints = post.points + value; 

    post.points = newPoints;
    post.save();

    return newPoints;
  }
}
