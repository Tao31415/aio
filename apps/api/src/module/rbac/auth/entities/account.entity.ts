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

@Entity('account')
export class Account {
  @PrimaryColumn('text')
  id!: string

  @Column('text')
  userId!: string

  @Column('text')
  accountId!: string

  @Column('text')
  providerId!: string

  @Column('text', { nullable: true })
  accessToken!: string | null

  @Column('text', { nullable: true })
  refreshToken!: string | null

  @Column('timestamp', { nullable: true })
  accessTokenExpiresAt!: Date | null

  @Column('timestamp', { nullable: true })
  refreshTokenExpiresAt!: Date | null

  @Column('text', { nullable: true })
  scope!: string | null

  @Column('text', { nullable: true })
  idToken!: string | null

  @Column('text', { nullable: true })
  password!: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User
}
