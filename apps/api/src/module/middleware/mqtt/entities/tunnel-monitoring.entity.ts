import { Entity, Column, Index, PrimaryColumn } from 'typeorm'
import { Hypertable, TimeColumn } from '@timescaledb/typeorm'

/**
 * 单条隧道监测数据（单环）
 */
@Hypertable({
  compression: {
    compress: true,
    compress_orderby: 'timestamp',
    compress_segmentby: 'ring_number',
    policy: {
      schedule_interval: '7 days',
    },
  },
})
@Entity('tunnel_monitoring_data')
export class TunnelMonitoringData {
  @TimeColumn()
  @PrimaryColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp!: Date

  @Column({ name: 'sn', type: 'text' })
  @Index()
  sn!: string

  @PrimaryColumn({ name: 'ring_number', type: 'text' })
  ringNumber!: string

  /** 拱腰水平（左） */
  @Column({
    name: 'p1x',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p1x!: number | null

  /** 拱腰沉降（左） */
  @Column({
    name: 'p1y',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p1y!: number | null

  /** 拱腰水平（右） */
  @Column({
    name: 'p7x',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p7x!: number | null

  /** 拱腰沉降（右） */
  @Column({
    name: 'p7y',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p7y!: number | null

  /** 道床水平（左） */
  @Column({
    name: 'p3x',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p3x!: number | null

  /** 道床沉降（左） */
  @Column({
    name: 'p3y',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p3y!: number | null

  /** 道床水平（右） */
  @Column({
    name: 'p5x',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p5x!: number | null

  /** 道床沉降（右） */
  @Column({
    name: 'p5y',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p5y!: number | null

  /** 拱顶水平 */
  @Column({
    name: 'p9x',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p9x!: number | null

  /** 拱顶沉降 */
  @Column({
    name: 'p9y',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  p9y!: number | null

  /** 净空收敛 = 9y - sd */
  @Column({
    name: 'coc',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  coc!: number | null

  /** 水平收敛 */
  @Column({
    name: 'hc',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  hc!: number | null

  /** 沉降位移 */
  @Column({
    name: 'sd',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  sd!: number | null
}

/**
 * MQTT 隧道监测消息外层结构
 * JSON 字段使用原始命名（如 1x, 1y），TypeScript 属性映射到 p1x, p1y
 */
export interface TunnelMonitoringPayload {
  timestamp: number
  sn: string
  data: Array<{
    rn: string
    /** 拱腰水平（左） */
    '1x'?: number
    /** 拱腰沉降（左） */
    '1y'?: number
    /** 拱腰水平（右） */
    '7x'?: number
    /** 拱腰沉降（右） */
    '7y'?: number
    /** 道床水平（左） */
    '3x'?: number
    /** 道床沉降（左） */
    '3y'?: number
    /** 道床水平（右） */
    '5x'?: number
    /** 道床沉降（右） */
    '5y'?: number
    /** 拱顶水平 */
    '9x'?: number
    /** 拱顶沉降 */
    '9y'?: number
    /** 净空收敛 */
    coc?: number
    /** 水平收敛 */
    hc?: number
    /** 沉降位移 */
    sd?: number
  }>
}
