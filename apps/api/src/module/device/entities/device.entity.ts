import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { MeasurementPoint } from './measurement-point.entity'
import { DevicePhoto } from './device-photo.entity'

@Entity('device')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string

  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code!: string

  @Column({ name: 'project', type: 'varchar', length: 255, nullable: true })
  project!: string | null

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 12,
    scale: 6,
    nullable: true,
  })
  longitude!: number | null

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 12,
    scale: 6,
    nullable: true,
  })
  latitude!: number | null

  @Column({
    name: 'elevation',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  elevation!: number | null

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

  @OneToMany(() => MeasurementPoint, (point) => point.device, {
    cascade: true,
  })
  measurementPoints!: MeasurementPoint[]

  @OneToMany(() => DevicePhoto, (photo) => photo.device, {
    cascade: true,
  })
  devicePhotos!: DevicePhoto[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date
}
