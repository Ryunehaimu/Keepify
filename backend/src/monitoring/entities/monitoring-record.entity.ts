import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { StorageItem } from '../../items/entities/storage-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity('monitoring_records')
export class MonitoringRecord extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good',
  })
  conditionStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  //@ManyToOne(() => StorageItem, storageItem => storageItem.monitoringRecords)
  @JoinColumn({ name: 'storage_item_id' })
  storageItem: StorageItem;

  @Column()
  storageItemId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column()
  adminId: number;
}