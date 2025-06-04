// src/users/entities/user.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EntrustmentOrder } from '../../items/entities/entrustment-order.entity'; // Fixed import path

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  // Fixed relationship to EntrustmentOrder
  @OneToMany(() => EntrustmentOrder, (order) => order.owner, {
    cascade: false, // Don't cascade delete orders when user is deleted (optional)
    eager: false,   // Don't auto-load orders unless explicitly requested
  })
  entrustmentOrders: EntrustmentOrder[];
}