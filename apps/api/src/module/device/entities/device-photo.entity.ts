import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Device } from './device.entity'

@Entity('device_photo')
export class DevicePhoto {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId!: string

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device

  /** MinIO 存储路径 */
  @Column({ name: 'object_name', type: 'varchar', length: 500 })
  objectName!: string

  /** 显示时刻 (HH:mm 格式，24小时制) */
  @Column({ name: 'display_time', type: 'varchar', length: 5, nullable: true })
  displayTime!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
