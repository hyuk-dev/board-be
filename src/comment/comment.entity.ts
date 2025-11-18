import { Post } from "../post/post.entity";
import { User } from "../user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, user => user.comments, { cascade: ['insert', 'update']})
  @JoinColumn({ name: "userId"})
  user: User;

  @ManyToOne(() => Post, post => post.comments, { cascade: ['insert', 'update']})
  @JoinColumn({ name: "postId"})
  post: Post;
}