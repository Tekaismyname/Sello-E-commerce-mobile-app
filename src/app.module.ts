import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [AuthModule, CatalogModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
