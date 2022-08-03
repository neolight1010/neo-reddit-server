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
import { Vote, VoteDirection } from "../entities/Vote";

@ObjectType()
class PostWithUserVote {
  @Field(() => Post)
  post: Post;

  @Field(() => VoteDirection, { nullable: true })
  userVote!: VoteDirection | null;
}

@ObjectType()
class PaginatedPostsWithVoteInfo {
  @Field(() => [PostWithUserVote])
  postsWithUserVote: PostWithUserVote[];

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

  @FieldResolver()
  async _pointsField(@Root() post: Post): Promise<number> {
    return await post.getPoints();
  }

  @Query(() => PaginatedPostsWithVoteInfo)
  async posts(
    @Ctx() { req }: RegularContext,
    /**The limit will be capped at 50.*/
    @Arg("limit", () => Int, { nullable: true }) limit?: number,
    /**All posts fetched will be older than the cursor's date.*/
    @Arg("cursor", () => Date, { nullable: true }) cursor?: Date
  ): Promise<PaginatedPostsWithVoteInfo> {
    const { userId } = req.session;
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

    const slicedPosts = posts.slice(0, limit);

    const postsWithUserVote: PostWithUserVote[] = await Promise.all(
      slicedPosts.map(async (post) => {
        let userVote: Vote | null;

        if (userId === undefined) {
          userVote = null;
        } else {
          userVote =
            (await Vote.findOne({
              where: {
                user: {
                  id: userId,
                },
                post,
              },
            })) ?? null;
        }

        return {
          post,
          userVote: userVote?.direction ?? null,
        };
      })
    );

    return {
      postsWithUserVote,
      hasMore: posts.length === limit + 1,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => ID) id: string): Promise<Post | undefined> {
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
  @UseMiddleware(isLoggedIn)
  async updatePost(
    @Arg("id", () => ID) id: string,
    @Arg("title", { nullable: true }) title: string,
    @Ctx() { req }: RegularContext
  ): Promise<Post | null> {
    const { userId } = req.session;

    const post = await Post.findOne({ where: { id, author: { id: userId } } });

    if (!post) return null;

    await Post.update({ id }, { title });

    return post;
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isLoggedIn)
  async deletePost(
    @Arg("id", () => ID) id: string,
    @Ctx() { req }: RegularContext
  ): Promise<boolean> {
    const userId = req.session.userId!;

    const post = await Post.findOne({
      where: {
        id,
        author: { id: userId },
      },
    });

    await post?.remove();
    return post !== undefined;
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

    const post = await Post.findOne(postId);

    if (post === undefined) {
      throw Error("Invalid postId");
    }

    const newPoints = await post.getPoints();

    return newPoints;
  }
}
