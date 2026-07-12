import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AssetsModule } from './modules/assets/assets.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    CategoriesModule,
    AssetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
