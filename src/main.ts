import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
	DocumentBuilder,
	SwaggerDocumentOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const config = new DocumentBuilder()
		.setOpenAPIVersion('3.2.0')
		.setTitle('Evently API')
		.setDescription('Manage Events')
		.setVersion('2.5.0')
		.addServer('http://localhost:3000', 'Local development server')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Bearer token authentication',
			},
			'BearerAuth',
		)
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Bearer token authentication for Scanner',
			},
			'BearerAuthScanner',
		)
		.build();

	const options: SwaggerDocumentOptions = {
		operationIdFactory: (_controllerKey: string, methodKey: string) =>
			methodKey,
	};

	const document = SwaggerModule.createDocument(app, config, options);

	SwaggerModule.setup('api', app, document);

	await app.listen(3000);
}

bootstrap();
