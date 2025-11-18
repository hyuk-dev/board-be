import { Comment } from '../comment/comment.entity';
import { User } from '../user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.posts, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: ['insert', 'update']})
  comments: Comment[];
}
