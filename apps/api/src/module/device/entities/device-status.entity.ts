import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { Device } from './device.entity'

export enum AlertStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  ALARM = 'alarm',
}

export enum OnlineStatus {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

@Entity('device_status')
export class DeviceStatus {
  @PrimaryColumn({ name: 'device_id', type: 'uuid' })
  deviceId!: string

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null

  @Column({
    name: 'is_online',
    type: 'boolean',
    default: false,
  })
  isOnline!: boolean

  @Column({
    name: 'alert_status',
    type: 'varchar',
    length: 20,
    default: AlertStatus.NORMAL,
  })
  alertStatus!: AlertStatus

  @Column({ name: 'last_checked_at', type: 'timestamptz', nullable: true })
  lastCheckedAt!: Date | null

  @Column({ name: 'data_count_1h', type: 'int', default: 0 })
  dataCount1h!: number

  @Column({
    name: 'avg_horizontal_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  avgHorizontal!: number | null

  @Column({
    name: 'avg_vertical_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  avgVertical!: number | null

  @Column({
    name: 'std_horizontal_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  stdHorizontal!: number | null

  @Column({
    name: 'std_vertical_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  stdVertical!: number | null

  @Column({
    name: 'max_horizontal_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  maxHorizontal!: number | null

  @Column({
    name: 'max_vertical_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  maxVertical!: number | null

  @Column({
    name: 'min_horizontal_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  minHorizontal!: number | null

  @Column({
    name: 'min_vertical_mm',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  minVertical!: number | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
