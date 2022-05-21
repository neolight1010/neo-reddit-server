import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

export enum VoteDirection {
  UP,
  DOWN,
}

@Entity()
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({type: "enum", enum: VoteDirection})
  direction!: VoteDirection;

  @ManyToOne(() => User, (user) => user.votes)
  user!: Promise<User>;

  @ManyToOne(() => Post, (post) => post.upvotes)
  post!: Promise<Post>;
}