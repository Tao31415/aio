import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('verification')
export class Verification {
  @PrimaryColumn('text')
  id: string

  @Column('text')
  identifier: string

  @Column('text')
  value: string

  @Column('timestamp')
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
