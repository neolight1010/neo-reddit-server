import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Vote, VoteDirection } from "./Vote";
import { User } from "./User";
import {createVotesFromPostsLoader} from "../loaders/votesLoader";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: string;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field({ name: "textSnippet" })
  _textSnippetField!: string;

  @Field({ name: "points" })
  _pointsField!: number;

  @ManyToOne(() => User, (user) => user.posts)
  author!: Promise<User>;

  @Column()
  authorId!: number;

  @Field(() => User, { name: "author" })
  _authorField!: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  votes!: Promise<Vote[]>;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(title: string, text: string, author?: User) {
    super();
    this.title = title;
    this.text = text;

    if (author) this.author = Promise.resolve(author);
  }

  async getPoints(votesLoader: ReturnType<typeof createVotesFromPostsLoader>): Promise<number> {
    let totalPoints = 0;

    const votes = await votesLoader.load(this.id);

    for (const vote of votes) {
      const voteValue = vote.direction == VoteDirection.UP ? 1 : -1;

      totalPoints += voteValue;
    }

    return totalPoints;
  }
}
