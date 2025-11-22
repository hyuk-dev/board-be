import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의된 속성만 허용
      forbidNonWhitelisted: true, // 정의되지 않은 속성은 예외 발생
      transform: true, // 타입 자동 변환
    }),
  );
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
