import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async createUser(email: string, nickname: string, hashedPassword: string) {
    const newUser = this.userRepository.create({
      email,
      nickname,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async saveRefreshToken(userId: number, hashedRefreshToken: string) {
    const result = await this.userRepository.update(
      { id: userId },
      { refreshToken: hashedRefreshToken },
    );
  }
}
