import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { StorageItem } from './storage-item.entity';

@Entity('item_details')
export class ItemDetail extends BaseEntity {
  @Column()
  itemName: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  conditionNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedValue: number;

  //@ManyToOne(() => StorageItem, storageItem => storageItem.itemDetails)
  @JoinColumn({ name: 'storage_item_id' })
  storageItem: StorageItem;

  @Column()
  storageItemId: number;
}