import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { Account } from './account.entity'
import { Session } from './session.entity'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('user')
export class User {
  @PrimaryColumn('text')
  id: string

  @Column('text')
  name: string

  @Column('text', { unique: true })
  email: string

  @Column('boolean', { default: false })
  emailVerified: boolean

  @Column('text', { nullable: true })
  image: string | null

  @Column({
    type: 'text',
    default: UserRole.USER,
  })
  role: UserRole

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[]

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[]
}
