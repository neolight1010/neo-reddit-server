import { Field, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

export enum VoteDirection {
  UP,
  DOWN,
}

registerEnumType(VoteDirection, {
  name: "VoteDirection",
});

@ObjectType()
@Entity()
@Unique(["user", "post"])
export class Vote extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: string;

  @Field(() => VoteDirection)
  @Column({ type: "enum", enum: VoteDirection })
  direction!: VoteDirection;

  @ManyToOne(() => User, (user) => user.votes)
  user!: Promise<User>;

  @Column()
  userId!: string;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: "CASCADE" })
  post!: Promise<Post>;
}
