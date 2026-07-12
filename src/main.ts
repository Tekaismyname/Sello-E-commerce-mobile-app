import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { MySqlDatabaseService } from './auth/services/mysql-database.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static assets from the public directory. Resolve from the process
  // working directory to match multer's './public/uploads' destination —
  // __dirname points into dist/ after build, where no public folder exists.
  app.useStaticAssets(join(process.cwd(), 'public'));

  const port = Number(process.env.PORT ?? 3000);
  const database = app.get(MySqlDatabaseService);

  await database.checkConnection();

  await app.listen(port);

  const baseUrl = await app.getUrl();
  console.log(`Sello Ecommerce API is running on: ${baseUrl}`);
  console.log(`Auth endpoints: ${baseUrl}/auth`);
}
bootstrap();
