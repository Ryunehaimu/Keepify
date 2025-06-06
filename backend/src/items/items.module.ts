// src/items/items.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { EntrustmentOrder } from './entities/entrustment-order.entity';
import { EntrustedItem } from './entities/entrusted-item.entity';
import { User } from '@src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntrustmentOrder,
      EntrustedItem,
      User,
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService], // Export service if needed by other modules
})
export class ItemsModule {}