import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
//import { ItemDetail } from './item-detail.entity';
//import { MonitoringRecord } from '../../monitoring/entities/monitoring-record.entity';

export enum StorageStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  STORED = 'stored',
  READY_PICKUP = 'ready_pickup',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum MonitoringFrequency {
  THREE_DAYS = '3_days',
  ONE_WEEK = '1_week',
}

@Entity('storage_items')
export class StorageItem extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @Column()
  durationDays: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  // Monitoring preferences
  @Column({ default: false })
  monitoringEnabled: boolean;

  @Column({
    type: 'enum',
    enum: MonitoringFrequency,
    default: MonitoringFrequency.ONE_WEEK,
  })
  monitoringFrequency: MonitoringFrequency;

  @Column({ default: true })
  allowChecking: boolean;

  // Status
  @Column({
    type: 'enum',
    enum: StorageStatus,
    default: StorageStatus.PENDING,
  })
  status: StorageStatus;

  // Pickup details
  @Column({ type: 'text', nullable: true })
  pickupAddress: string;

  @Column({ nullable: true })
  pickupDate: Date;

  @Column({ type: 'text', nullable: true })
  pickupNotes: string;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number;

  /*
  @OneToMany(() => ItemDetail, itemDetail => itemDetail.storageItem)
  itemDetails: ItemDetail[];

  @OneToMany(() => MonitoringRecord, monitoring => monitoring.storageItem)
  monitoringRecords: MonitoringRecord[];
  */
}