import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AllocationsModule } from './modules/allocations/allocations.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AuditsModule } from './modules/audits/audits.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    CategoriesModule,
    AssetsModule,
    // ── Developer 2 modules ──────────────────────────────
    AllocationsModule,   // POST /allocations, PATCH /allocations/:id/return
    TransfersModule,     // POST /transfers, PATCH /transfers/:id/dept-approve|manager-approve
    BookingsModule,      // POST /bookings, GET /bookings/slots
    AuditsModule,        // POST /audits/cycles|assignments|verifications, PATCH /audits/cycles/:id/lock
    GatewayModule,       // Socket.IO WebSocket gateway (notification:new, dashboard:refresh)
    MaintenanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
