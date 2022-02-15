import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field({ name: "textSnippet" })
  _textSnippetField!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  author!: User;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(title: string, text: string, author: User) {
    super();
    this.title = title;
    this.text = text;
    this.author = author;
  }
}
