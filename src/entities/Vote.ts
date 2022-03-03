import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => User, (user) => user.upvotes)
  @JoinTable()
  users!: Promise<User[]>;

  @ManyToOne(() => Post, (post) => post.upvotes)
  post!: Promise<Post>;
}
