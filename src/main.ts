import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               
      forbidNonWhitelisted: true,    
      transform: true,        
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors();

  // Enable versioning
  // app.enableVersioning({ 
  //   type: VersioningType.URI, 
  //   prefix: 'api/v',
  //   defaultVersion: '1'
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
