import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MySqlDatabaseService } from './auth/services/mysql-database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const database = app.get(MySqlDatabaseService);

  await database.checkConnection();

  await app.listen(port);

  const baseUrl = await app.getUrl();
  console.log(`Sello Ecommerce API is running on: ${baseUrl}`);
  console.log(`Auth endpoints: ${baseUrl}/auth`);
}
bootstrap();
