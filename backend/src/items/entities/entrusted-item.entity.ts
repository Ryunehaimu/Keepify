// src/items/entities/entrusted-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntrustmentOrder } from './entrustment-order.entity';

@Entity('entrusted_item')
export class EntrustedItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entrustmentOrderId', nullable: false })
  entrustmentOrderId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estimatedValue?: string; // Keep as string for flexibility

  @Column({ type: 'varchar', length: 100, nullable: true })
  itemCondition?: string; // Match the DTO field name

  @Column({ type: 'int', default: 1, nullable: false })
  quantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Column({ type: 'text', nullable: true })
  specialInstructions?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationship to EntrustmentOrder
  @ManyToOne(() => EntrustmentOrder, order => order.entrustedItems, {
    onDelete: 'CASCADE', // When order is deleted, items are also deleted
  })
  @JoinColumn({ name: 'entrustmentOrderId' })
  entrustmentOrder: EntrustmentOrder;
}