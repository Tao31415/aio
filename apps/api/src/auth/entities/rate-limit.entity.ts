import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity('rateLimit')
export class RateLimit {
  @PrimaryColumn()
  id: string

  @Column()
  key: string

  @Column('int')
  count: number

  @Column('bigint')
  lastRequest: number
}
