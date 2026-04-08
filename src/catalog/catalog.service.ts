import { Injectable } from '@nestjs/common';
import { MySqlDatabaseService } from '../auth/services/mysql-database.service';

@Injectable()
export class CatalogService {
  constructor(private readonly database: MySqlDatabaseService) {}

  async getHome() {
    const [categories, featuredProducts, brands] = await Promise.all([
      this.database.getHomeCategories(),
      this.database.getHomeProducts(),
      this.database.getHomeBrands(),
    ]);

    return {
      message: 'Home data fetched successfully',
      categories,
      featuredProducts,
      brands,
    };
  }
}
