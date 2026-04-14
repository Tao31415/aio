import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity('session')
export class Session {
  @PrimaryColumn('text')
  id: string

  @Column('text')
  userId: string

  @Column('text', { unique: true })
  token: string

  @Column('timestamp')
  expiresAt: Date

  @Column('text', { nullable: true })
  ipAddress: string | null

  @Column('text', { nullable: true })
  userAgent: string | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User
}
