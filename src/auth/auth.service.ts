import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, nickname, password } = registerDto;

    // 이메일 중복 체크
    const exists = await this.userService.findUserByEmail(email);
    if (exists) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성 및 저장
    const newUser = await this.userService.createUser(
      email,
      nickname,
      hashedPassword,
    );

    return plainToInstance(User, newUser);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 이메일로 유저 조회
    const user = await this.userService.findUserByEmail(email);
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

    // 토큰 생성

    const { accessToken, refreshToken } = await this.createTokens(user);

    // 토큰 DB에 저장
    
    this.userService.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
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
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    });

    // refreshToken은 DB에 해시로 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedRefreshToken;
    await this.userService.saveRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * 리프레시 토큰 검증 서비스
   * @param userId
   * @param refreshToken
   * @returns boolean | null
   */
  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findUserById(userId);
    if (!user || !user.refreshToken) return null;
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    return isMatch ? user : null;
  }
}
