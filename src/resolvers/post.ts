import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { RegularContext } from "../types";
import { User } from "../entities/User";

@InputType()
class CreatePostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return await Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("input") { title, text }: CreatePostInput,
    @Ctx() { req }: RegularContext
  ): Promise<Post> {
    if (!req.session.userId) {
      throw new Error("Not authenticated.");
    }

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
