import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, nickname, password } = registerDto;

    // 이메일 중복 체크
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성 및 저장
    const newUser = this.userRepository.create({
      email,
      nickname,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);

    return plainToInstance(User, newUser);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 이메일로 유저 조회
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    // 비밀번호 검증

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }
  }

  /**
   * 토큰 생성 서비스
   * 사용자가 로그인하거나 리프레시 토큰을 재발급 받을 때 호출
   * 
   * @param user 
   * @returns accessToken, refreshToken
   */
  async createTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // refreshToken은 DB에 해시로 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  /**
   * 리프레시 토큰 검증 서비스
   * @param userId
   * @param refreshToken
   * @returns
   */

}
