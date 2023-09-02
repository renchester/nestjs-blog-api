import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidateInputPipe } from './core/pipes/validate.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Handle all user input validation globally
  app.useGlobalPipes(new ValidateInputPipe());

  await app.listen(3000);
}
bootstrap();
