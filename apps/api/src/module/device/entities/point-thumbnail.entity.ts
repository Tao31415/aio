import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { MeasurementPoint } from './measurement-point.entity'
import { DevicePhoto } from './device-photo.entity'

@Entity('point_thumbnail')
export class PointThumbnail {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'measurement_point_id', type: 'uuid' })
  measurementPointId!: string

  @ManyToOne(() => MeasurementPoint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'measurement_point_id' })
  measurementPoint!: MeasurementPoint

  @Column({ name: 'device_photo_id', type: 'uuid', nullable: true })
  devicePhotoId!: string | null

  @ManyToOne(() => DevicePhoto, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'device_photo_id' })
  devicePhoto!: DevicePhoto | null

  @Column({ name: 'object_name', type: 'varchar', length: 500 })
  objectName!: string

  @Column({ name: 'crop_x', type: 'int' })
  cropX!: number

  @Column({ name: 'crop_y', type: 'int' })
  cropY!: number

  @Column({ name: 'crop_size', type: 'int' })
  cropSize!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date
}
