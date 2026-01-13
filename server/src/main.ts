import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { winstonConfig } from './config/logger.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Enable cookie parsing
  app.use(cookieParser());

  // Set global API prefix with version
  const version = process.env.API_VERSION;
  const apiPrefix = `kanban-board/api/v${version}`;
  app.setGlobalPrefix(apiPrefix);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Kanban Board API')
    .setDescription(`
      ## Kanban Board REST API Documentation
      
      This API provides endpoints for managing:
      - **Users** - User registration and management
      - **Boards** - Kanban board CRUD operations
      - **Columns** - Board columns management
      - **Tasks** - Task management within columns
      - **Authentication** - JWT-based authentication
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used to reference this security scheme
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Boards', 'Board management endpoints')
    .addTag('Columns', 'Column management endpoints')
    .addTag('Tasks', 'Task management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Remember token after page refresh
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Kanban Board API Docs',
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS with credentials support for cookies
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST;
  await app.listen(port);
  logger.log(`🚀 Application is running on: ${host}:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger docs available at: ${host}:${port}/${apiPrefix}/docs`);
}
bootstrap();

