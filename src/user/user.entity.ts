import { Exclude } from 'class-transformer';
import { Comment } from '../comment/comment.entity';
import { Post } from '../post/post.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true})
  @Exclude()
  refreshToken: string;

  @Column({ unique: true })
  nickname: string;

  @OneToMany(() => Post, post => post.user, { cascade: ['update', 'insert']})
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.user, { cascade: ['update', 'insert']})
  comments: Comment[];
}
