import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm'

@Entity('mqtt_messages')
@Index(['topic'])
@Index(['createdAt'])
export class MqttMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 512 })
  topic!: string

  @Column({ type: 'text', nullable: true })
  payload!: string | null

  @Column({ type: 'int', default: 0 })
  qos!: number

  @Column({ default: false })
  retained!: boolean

  @CreateDateColumn()
  createdAt!: Date
}
