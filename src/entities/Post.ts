import { Field, ObjectType } from "type-graphql";
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
import { Vote } from "./Vote";
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

  @ManyToOne(() => User, (user) => user.posts)
  author!: Promise<User>;

  @Field(() => User, { name: "author" })
  _authorField!: User;

  @OneToMany(() => Vote, (vote) => vote.post)
  upvotes!: Promise<Vote[]>;

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
}
