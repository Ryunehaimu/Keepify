// src/items/entities/entrustment-order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntrustedItem } from './entrusted-item.entity';
import { User } from '../../users/entities/user.entity'; // Add User import

export enum OrderStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  STORED = 'STORED',
  PENDING_DELIVERY = 'PENDING_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum MonitoringFrequency {
  NONE = 'none',
  WEEKLY_ONCE = 'weekly_once',
  WEEKLY_TWICE = 'weekly_twice',
}

@Entity('entrustment_order')
export class EntrustmentOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  ownerId: number;

  @Column({ type: 'boolean', default: false })
  allowChecks: boolean;

  @Column({
    type: 'enum',
    enum: MonitoringFrequency,
    default: MonitoringFrequency.NONE,
  })
  monitoringFrequency: MonitoringFrequency;

  @Column({ type: 'datetime', nullable: false })
  pickupRequestedDate: Date;

  @Column({ type: 'text', nullable: false })
  pickupAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  contactPhone: string;

  @Column({ type: 'datetime', nullable: true })
  expectedRetrievalDate?: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PICKUP,
  })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagePath?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationship to EntrustedItems
  @OneToMany(() => EntrustedItem, item => item.entrustmentOrder, {
    cascade: true, // When saving order, also save items
    eager: false,   // Don't auto-load items unless explicitly requested
  })
  entrustedItems: EntrustedItem[];

  // Relationship to User (Owner)
  @ManyToOne(() => User, user => user.entrustmentOrders, {
    onDelete: 'CASCADE', // When user is deleted, orders are also deleted
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;
}