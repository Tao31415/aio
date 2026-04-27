import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { Device } from './device.entity'
import { PointThumbnail } from './point-thumbnail.entity'

@Entity('measurement_point')
export class MeasurementPoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId!: string

  @ManyToOne(() => Device, (device) => device.measurementPoints, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'device_id' })
  device!: Device

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string

  @Column({
    name: 'coord_x',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
  })
  coordX!: number | null

  @Column({
    name: 'coord_y',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
  })
  coordY!: number | null

  @Column({
    name: 'coord_z',
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
  })
  coordZ!: number | null

  @Column({
    name: 'ring_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  ringNumber!: string | null

  @Column({ name: 'size', type: 'varchar', length: 100, nullable: true })
  size!: string | null

  /** 水平位移预警阈值 (mm) */
  @Column({
    name: 'warning_threshold_horizontal',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  warningThresholdHorizontal!: number | null

  /** 垂直位移预警阈值 (mm) */
  @Column({
    name: 'warning_threshold_vertical',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  warningThresholdVertical!: number | null

  /** 水平位移报警阈值 (mm) */
  @Column({
    name: 'alarm_threshold_horizontal',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  alarmThresholdHorizontal!: number | null

  /** 垂直位移报警阈值 (mm) */
  @Column({
    name: 'alarm_threshold_vertical',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  alarmThresholdVertical!: number | null

  @OneToMany(() => PointThumbnail, (thumbnail) => thumbnail.measurementPoint)
  pointThumbnails!: PointThumbnail[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
