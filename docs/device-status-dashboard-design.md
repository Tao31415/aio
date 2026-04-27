# 首页设备统计功能设计文档

## 📋 功能概述

首页设备统计功能用于实时展示设备监控系统的关键指标，包括：

- **设备总数**：系统中注册的所有设备数量
- **在线设备**：最近5分钟内收到过MQTT数据的设备
- **离线设备**：超过5分钟未收到MQTT数据的设备
- **预警设备**：监测数据超过预警阈值的设备
- **报警设备**：监测数据超过报警阈值的设备
- **正常设备**：监测数据在正常范围内的设备

---

## ⏰ 关键时间点详解

### 📊 1. 数据统计时间窗口
**时间范围**：过去 1 小时（60 分钟）

**作用**：
- 从 TimescaleDB 查询每个设备过去 1 小时内的所有监测数据
- 计算统计特征：均值、标准差、最大值、最小值
- 用于判断设备是否存在异常趋势

**为什么是 1 小时**：
- 足够长的窗口可以过滤掉瞬时噪声
- 足够短的时间保证告警的时效性
- 符合工程监测的行业标准做法

### 🔵 2. 在线状态判定
**时间阈值**：5 分钟

**判断规则**：
```
设备在线 = 最后收到 MQTT 数据时间距现在 < 5 分钟
设备离线 = 最后收到 MQTT 数据时间距现在 ≥ 5 分钟
```

**实际时间线示例**：
```
10:00:00 - 设备发送 MQTT 数据 → lastSeenAt = 10:00:00
10:04:59 - 查询状态 → isOnline = true  (4分59秒 < 5分钟)
10:05:01 - 查询状态 → isOnline = false (5分01秒 ≥ 5分钟)
```

### ⏱️ 3. 定时任务执行间隔

#### 任务 1：设备状态全面更新
**执行频率**：每 5 分钟
**任务内容**：
- 遍历所有设备
- 计算过去 1 小时的统计特征
- 判断告警状态
- 更新数据库

**执行时机**：
```
00:00 - 执行
00:05 - 执行
00:10 - 执行
...
```

#### 任务 2：在线状态检查
**执行频率**：每 1 分钟
**任务内容**：
- 检查所有设备的 `lastSeenAt`
- 更新在线/离线状态

**作用**：
- 如果 MQTT 数据中断，可以更快检测到设备离线
- 补充全面更新任务的间隔

### 🔄 4. 前端自动刷新
**刷新间隔**：每 30 秒

**为什么是 30 秒**：
- 足够及时显示最新统计数据
- 不会对服务器造成过大压力
- 用户体验流畅

---

## 🔧 技术架构

### 1. 数据库设计

#### device_status 表

```sql
CREATE TABLE device_status (
    device_id UUID PRIMARY KEY,
    last_seen_at TIMESTAMPTZ,              -- 最后收到数据时间
    is_online BOOLEAN DEFAULT FALSE,        -- 是否在线
    alert_status VARCHAR(20),                -- normal | warning | alarm
    last_checked_at TIMESTAMPTZ,            -- 最后检查时间
    data_count_1h INTEGER DEFAULT 0,       -- 过去1小时数据条数

    -- 水平位移统计特征
    avg_horizontal_mm DECIMAL,              -- 水平位移均值
    std_horizontal_mm DECIMAL,              -- 水平位移标准差
    max_horizontal_mm DECIMAL,              -- 水平位移最大值
    min_horizontal_mm DECIMAL,              -- 水平位移最小值

    -- 垂直位移统计特征
    avg_vertical_mm DECIMAL,                -- 垂直位移均值
    std_vertical_mm DECIMAL,                -- 垂直位移标准差
    max_vertical_mm DECIMAL,                -- 垂直位移最大值
    min_vertical_mm DECIMAL,                -- 垂直位移最小值

    created_at TIMESTAMPTZ,                 -- 记录创建时间
    updated_at TIMESTAMPTZ                  -- 记录更新时间
);
```

**索引优化**：
```sql
CREATE INDEX idx_device_status_alert_status ON device_status(alert_status);
CREATE INDEX idx_device_status_is_online ON device_status(is_online);
CREATE INDEX idx_device_status_last_seen_at ON device_status(last_seen_at);
```

---

### 2. 告警判断算法

#### 2.1 统计特征计算

从 TimescaleDB 查询过去 **1小时** 内的所有监测数据，计算以下统计特征：

```sql
SELECT
    COUNT(*) as count,

    -- 水平位移统计（取所有x方向字段的最大绝对值）
    AVG(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x))) as avg_horizontal,
    STDDEV(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x))) as std_horizontal,
    MAX(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x))) as max_horizontal,
    MIN(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x))) as min_horizontal,

    -- 垂直位移统计（取所有y方向字段的最大绝对值）
    AVG(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd))) as avg_vertical,
    STDDEV(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd))) as std_vertical,
    MAX(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd))) as max_vertical,
    MIN(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd))) as min_vertical

FROM tunnel_monitoring_data
WHERE sn = $1
  AND timestamp >= $2  -- 1小时前
  AND timestamp <= $3  -- 当前时间
```

**数据字段说明**：
- `p1x/p1y`：拱腰水平/沉降（左）
- `p7x/p7y`：拱腰水平/沉降（右）
- `p3x/p3y`：道床水平/沉降（左）
- `p5x/p5y`：道床水平/沉降（右）
- `p9x/p9y`：拱顶水平/沉降
- `sd`：沉降位移

#### 2.2 告警判断规则

对每个测点的配置阈值进行对比：

```
报警条件（优先级最高）：
├─ max_horizontal > alarmThresholdHorizontal
├─ max_horizontal > (avg_horizontal + 2 × std_horizontal) > alarmThresholdHorizontal
├─ max_vertical > alarmThresholdVertical
└─ max_vertical > (avg_vertical + 2 × std_vertical) > alarmThresholdVertical

预警条件（无报警时生效）：
├─ max_horizontal > warningThresholdHorizontal
├─ max_horizontal > (avg_horizontal + 2 × std_horizontal) > warningThresholdHorizontal
├─ max_vertical > warningThresholdVertical
└─ max_vertical > (avg_vertical + 2 × std_vertical) > warningThresholdVertical
```

#### 2.3 算法优势

1. **抗噪声**：使用1小时内的统计数据，而非单个瞬时值，避免瞬时波动误报
2. **趋势判断**：通过 `avg + 2*std` 判断数据是否有明显趋势偏离
3. **极值捕捉**：通过 `max` 捕捉突发的极端值
4. **科学依据**：符合工程监测领域的标准做法

#### 2.4 判断示例

假设某测点配置：
- 预警阈值：水平 5mm，垂直 8mm
- 报警阈值：水平 10mm，垂直 15mm

过去 1 小时数据统计：
- avg_horizontal = 3mm
- std_horizontal = 1mm
- max_horizontal = 6mm
- avg_vertical = 6mm
- std_vertical = 2mm
- max_vertical = 12mm

判断过程：
```
1. 检查报警条件：
   - max_horizontal (6mm) > alarmThresholdHorizontal (10mm)? 否
   - max_horizontal > avg + 2×std (3+2×1=5mm) > 10mm? 否
   - max_vertical (12mm) > alarmThresholdVertical (15mm)? 否
   - max_vertical > avg + 2×std (6+2×2=10mm) > 15mm? 否
   → 没有报警

2. 检查预警条件：
   - max_horizontal (6mm) > warningThresholdHorizontal (5mm)? 是 ✓
   → 触发预警
```

---

### 3. 定时任务调度

#### 3.1 任务总览

| 任务名称 | 执行频率 | 作用 | 关键时间点 |
|---------|---------|------|----------|
| 设备状态全面更新 | 每 5 分钟 | 计算统计特征，判断告警状态 | 5 分钟 |
| 在线状态检查 | 每 1 分钟 | 更新设备在线/离线状态 | 1 分钟 |
| 前端自动刷新 | 每 30 秒 | 更新前端显示的统计数据 | 30 秒 |

#### 3.2 任务执行流程

```
[每 5 分钟]
   ↓
1. 查询所有设备列表
   ↓
2. 对每个设备执行：
   ├─ 查询 TimescaleDB（过去 1 小时数据）
   ├─ 计算统计特征
   ├─ 查询测点阈值配置
   ├─ 判断告警状态
   └─ 更新 device_status 表
   ↓
3. 汇总统计信息
   ↓
4. 记录日志

[每 1 分钟]
   ↓
1. 查询所有设备状态
   ↓
2. 检查 lastSeenAt
   ↓
3. 更新 isOnline 字段
```

---

### 4. API 接口详解

#### 4.1 获取首页统计

**接口**：`GET /api/v1/statistics/dashboard`

**说明**：获取所有设备的汇总统计信息

**请求示例**：
```bash
curl http://localhost:30000/api/v1/statistics/dashboard
```

**响应示例**：
```json
{
  "totalDevices": 15,
  "onlineDevices": 12,
  "offlineDevices": 3,
  "warningDevices": 2,
  "alarmDevices": 1,
  "normalDevices": 12
}
```

**响应字段说明**：
- `totalDevices`：系统中注册的所有设备数量
- `onlineDevices`：最近 5 分钟内收到 MQTT 数据的设备数量
- `offlineDevices`：超过 5 分钟未收到 MQTT 数据的设备数量
- `warningDevices`：监测数据超过预警阈值的设备数量
- `alarmDevices`：监测数据超过报警阈值的设备数量
- `normalDevices`：监测数据在正常范围内的设备数量

#### 4.2 获取设备状态列表

**接口**：`GET /api/v1/statistics/device-status`

**说明**：获取所有设备的详细状态信息

**请求示例**：
```bash
curl http://localhost:30000/api/v1/statistics/device-status
```

**响应示例**：
```json
[
  {
    "deviceId": "uuid-string",
    "device": {
      "id": "uuid-string",
      "name": "设备名称",
      "code": "SN001",
      "project": "项目名称",
      "longitude": "121.000000",
      "latitude": "31.000000"
    },
    "isOnline": true,
    "alertStatus": "normal",
    "lastSeenAt": "2024-01-15T10:30:00Z",
    "lastCheckedAt": "2024-01-15T10:35:00Z",
    "dataCount1h": 720,
    "avgHorizontal": 2.5,
    "stdHorizontal": 0.8,
    "maxHorizontal": 5.2,
    "minHorizontal": 1.0,
    "avgVertical": 3.1,
    "stdVertical": 1.2,
    "maxVertical": 6.5,
    "minVertical": 1.5
  }
]
```

**字段说明**：
- `deviceId`：设备 ID（UUID）
- `device`：设备详细信息对象
- `isOnline`：是否在线（true/false）
- `alertStatus`：告警状态（normal/warning/alarm）
- `lastSeenAt`：最后收到数据时间
- `lastCheckedAt`：最后检查时间
- `dataCount1h`：过去 1 小时的数据条数
- `avgHorizontal`：水平位移均值（mm）
- `stdHorizontal`：水平位移标准差（mm）
- `maxHorizontal`：水平位移最大值（mm）
- `minHorizontal`：水平位移最小值（mm）
- `avgVertical`：垂直位移均值（mm）
- `stdVertical`：垂直位移标准差（mm）
- `maxVertical`：垂直位移最大值（mm）
- `minVertical`：垂直位移最小值（mm）

#### 4.3 获取单个设备状态

**接口**：`GET /api/v1/statistics/device-status/:deviceId`

**说明**：获取指定设备的详细状态信息

**请求示例**：
```bash
curl http://localhost:30000/api/v1/statistics/device-status/403c3391-caab-4f68-8ca2-eee9bd2f70a5
```

**响应示例**：（同设备状态列表中的单个对象）

---

### 5. 前端集成

#### 5.1 Pinia Store

```typescript
// stores/device-stats.store.ts
export const useDeviceStatsStore = defineStore('device-stats', () => {
  const stats = ref<DashboardStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    warningDevices: 0,
    alarmDevices: 0,
    normalDevices: 0,
  })

  const loading = ref(false)
  const lastRefresh = ref<Date | null>(null)

  async function fetchDashboardStats() {
    // 获取统计数据
  }

  function startAutoRefresh(intervalMs: number = 30000) {
    // 每 30 秒自动刷新
  }

  function stopAutoRefresh() {
    // 停止自动刷新
  }

  return { stats, loading, lastRefresh, fetchDashboardStats, startAutoRefresh, stopAutoRefresh }
})
```

#### 5.2 组件使用

```vue
<script setup lang="ts">
const deviceStatsStore = useDeviceStatsStore()

const stats = computed(() => [
  { title: '设备总数', value: deviceStatsStore.stats.totalDevices },
  { title: '在线设备', value: deviceStatsStore.stats.onlineDevices },
  { title: '预警设备', value: deviceStatsStore.stats.warningDevices },
  { title: '报警设备', value: deviceStatsStore.stats.alarmDevices },
])

onMounted(() => {
  deviceStatsStore.fetchDashboardStats()
  deviceStatsStore.startAutoRefresh(30000) // 每 30 秒刷新
})

onUnmounted(() => {
  deviceStatsStore.stopAutoRefresh()
})
</script>
```

---

## 📁 文件清单

### 后端文件

1. **实体定义**
   - `apps/api/src/module/device/entities/device-status.entity.ts` - DeviceStatus 实体

2. **服务层**
   - `apps/api/src/module/device/device-status.service.ts` - 核心业务逻辑
   - `apps/api/src/module/device/device-status.scheduler.ts` - 定时任务调度器

3. **控制器**
   - `apps/api/src/module/device/device-statistics.controller.ts` - API 接口控制器

4. **模块注册**
   - `apps/api/src/module/device/device.module.ts` - Device 模块
   - `apps/api/src/app.module.ts` - 应用模块（添加 ScheduleModule）

5. **数据库脚本**
   - `scripts/create-device-status-table.sql` - 手动建表脚本

### 前端文件

1. **状态管理**
   - `apps/web/app/stores/device-stats.store.ts` - Pinia Store

2. **页面组件**
   - `apps/web/app/pages/home.vue` - 首页组件

---

## 🚀 快速开始

### 1. 环境准备

确保已安装依赖：
```bash
cd apps/api
npm install @nestjs/schedule
```

### 2. 启动应用

```bash
# 终端 1：启动 API 服务
cd apps/api
npm run start:dev
# 服务地址：http://localhost:30000

# 终端 2：启动 Web 服务
cd apps/web
npm run dev
# 访问地址：http://localhost:40000/home
```

### 3. 测试 MQTT 数据

启动 MQTT 测试脚本生成模拟数据：

```bash
cd d:\Dev\Projects\aio\script
node mqtt-tester.js
# 每 1 秒发送一次数据
```

### 4. 验证功能

#### 步骤 1：检查设备列表
```bash
curl http://localhost:30000/api/v1/device
```
预期：返回所有设备信息

#### 步骤 2：检查初始统计
```bash
curl http://localhost:30000/api/v1/statistics/dashboard
```
预期：
```json
{
  "totalDevices": 2,
  "onlineDevices": 0,
  "offlineDevices": 2,
  "warningDevices": 0,
  "alarmDevices": 0,
  "normalDevices": 2
}
```

#### 步骤 3：运行 MQTT 测试脚本
```bash
cd d:\Dev\Projects\aio\script
node mqtt-tester.js
```
保持运行至少 **5 分钟**，让系统收集足够数据

#### 步骤 4：等待定时任务执行
- **1 分钟后**：设备应变为"在线"状态
- **5 分钟后**：第一次全面统计更新完成

#### 步骤 5：再次检查统计
```bash
curl http://localhost:30000/api/v1/statistics/dashboard
```
预期：
```json
{
  "totalDevices": 2,
  "onlineDevices": 2,
  "offlineDevices": 0,
  "warningDevices": 0,
  "alarmDevices": 0,
  "normalDevices": 2
}
```

#### 步骤 6：检查详细状态
```bash
curl http://localhost:30000/api/v1/statistics/device-status
```
预期：返回包含统计特征的设备状态列表

#### 步骤 7：查看前端
在浏览器访问 `http://localhost:40000/home`

预期：
- 统计卡片显示实时数据
- 底部显示"最后更新时间"
- 每 30 秒自动刷新

---

## ⏱️ 时间线示例

假设系统在 10:00 启动，MQTT 数据从 10:01 开始发送：

```
10:00:00 - API 服务启动
           - ScheduleModule 初始化
           - DeviceStatusScheduler 注册

10:00:01 - Web 服务启动
           - 前端开始每 30 秒刷新统计数据

10:01:00 - MQTT 测试脚本开始发送数据
           - 设备 SN001 开始收到数据
           - lastSeenAt = 10:01:00

10:02:00 - [定时任务：在线状态检查]
           - 检查 SN001 的 lastSeenAt (10:01:00)
           - 距现在 1 分钟 < 5 分钟
           - 更新 isOnline = true

10:05:00 - [定时任务：在线状态检查]
           - SN001 仍在发送数据
           - lastSeenAt 更新为最新时间
           - isOnline = true

10:06:00 - [定时任务：设备状态全面更新]
           - 查询 SN001 过去 1 小时数据 (10:06 - 1h ~ 10:06)
           - 由于只运行了 5 分钟，实际数据只有 5 分钟
           - 计算统计特征
           - 判断告警状态
           - 更新 device_status 表

10:11:00 - [定时任务：设备状态全面更新]
           - 此时已有 10 分钟数据
           - 统计特征更准确
           - 判断告警状态

10:15:00 - [用户查看前端]
           - 显示最新的统计数据
           - 包含过去 15 分钟的统计特征
           - 如果超过 1 小时数据不足，会显示 dataCount1h 较小
```

---

## ⚙️ 配置参数

可以在相应文件中调整以下参数：

### device-status.service.ts

```typescript
// 在线阈值（分钟）- 超过此时间未收到数据判定为离线
const ONLINE_THRESHOLD_MINUTES = 5

// 统计时间窗口（小时）- 用于计算统计特征的时间范围
const STATISTICS_TIME_WINDOW_HOURS = 1

// 标准差倍数 - 用于趋势判断
const STD_DEV_MULTIPLIER = 2
```

### device-status.scheduler.ts

```typescript
// 定时任务执行间隔
@Cron(CronExpression.EVERY_5_MINUTES)  // 全面更新
@Cron(CronExpression.EVERY_MINUTE)     // 在线状态检查
```

### device-stats.store.ts (前端)

```typescript
// 前端自动刷新间隔（毫秒）
const intervalMs = 30000  // 30 秒
```

---

## 🔍 故障排查

### 问题 1：统计数据全为 0

**检查步骤**：
```bash
# 1. 确认 MQTT 服务是否运行
curl http://localhost:30000/api/v1/mqtt/tunnel-monitoring/sn

# 2. 确认 TimescaleDB 是否有数据
curl http://localhost:30000/api/v1/mqtt/tunnel-monitoring/latest

# 3. 确认设备 SN 与 MQTT 数据的 sn 是否匹配
# 在 device 表中查找设备的 code
curl http://localhost:30000/api/v1/device

# 在 tunnel_monitoring_data 表中查找对应的 sn
```

**可能原因**：
- MQTT 服务未启动
- 测试脚本未运行
- 设备的 code 与 MQTT 数据的 sn 不一致

### 问题 2：告警状态不正确

**检查步骤**：
```bash
# 1. 查看设备统计特征
curl http://localhost:30000/api/v1/statistics/device-status

# 2. 检查测点阈值配置
# 通过 Swagger UI： http://localhost:30000/api/docs
# 或直接查看数据库 measurement_point 表
```

**可能原因**：
- 测点未配置阈值（阈值字段为 NULL）
- 阈值单位不一致（应为 mm）
- 数据量不足（需要至少 1 小时数据才能准确判断）

### 问题 3：设备一直显示离线

**检查步骤**：
```bash
# 1. 确认 MQTT 数据是否正常发送
# 查看 MQTT 测试脚本输出

# 2. 检查 lastSeenAt 时间
curl http://localhost:30000/api/v1/statistics/device-status

# 3. 手动触发定时任务（等待 1 分钟）
```

**可能原因**：
- MQTT 数据发送间隔超过 5 分钟
- MQTT 服务连接失败
- 网络延迟

### 问题 4：前端显示数据不更新

**检查步骤**：
```bash
# 1. 确认 API 是否正常
curl http://localhost:30000/api/v1/statistics/dashboard

# 2. 检查浏览器控制台错误

# 3. 查看网络请求（F12 -> Network）
```

**可能原因**：
- API 服务异常
- 前端自动刷新未启动
- 浏览器缓存问题

---

## 📊 性能优化建议

### 1. TimescaleDB 连续聚合

为 `tunnel_monitoring_data` 创建连续聚合视图，自动计算统计特征：

```sql
-- 创建连续聚合视图
CREATE MATERIALIZED VIEW device_statistics_1h
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', timestamp) AS bucket,
    sn,
    COUNT(*) as count,
    AVG(GREATEST(ABS(p1x), ABS(p7x), ABS(p3x), ABS(p5x), ABS(p9x))) as avg_horizontal,
    AVG(GREATEST(ABS(p1y), ABS(p7y), ABS(p3y), ABS(p5y), ABS(p9y), ABS(sd))) as avg_vertical
FROM tunnel_monitoring_data
GROUP BY bucket, sn;

-- 添加刷新策略
SELECT add_continuous_aggregate_policy('device_statistics_1h',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');
```

### 2. Redis 缓存

在 `device-status.service.ts` 中添加 Redis 缓存：

```typescript
@Injectable()
export class DeviceStatusService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ...
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const cached = await this.cacheManager.get<DashboardStats>('dashboard:stats');
    if (cached) return cached;

    const stats = await this.calculateStats();
    await this.cacheManager.set('dashboard:stats', stats, { ttl: 30 }); // 30 秒缓存
    return stats;
  }
}
```

### 3. 索引优化

为高频查询字段创建复合索引：

```sql
CREATE INDEX idx_tunnel_monitoring_sn_timestamp
ON tunnel_monitoring_data (sn, timestamp DESC);

CREATE INDEX idx_device_status_alert_online
ON device_status (alert_status, is_online);
```

### 4. 批量处理优化

在定时任务中使用 Promise.all 并行处理多个设备：

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async updateAllDeviceStatuses() {
  const devices = await this.deviceService.findAllDevices();

  // 并行处理所有设备
  const results = await Promise.allSettled(
    devices.map(device =>
      this.deviceStatusService.updateDeviceStatus(device.id, device.code)
    )
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  this.logger.log({ succeeded, failed }, 'Device status update completed');
}
```

---

## 🔮 未来扩展

### Phase 1：基础功能 ✅
- [x] 设备统计卡片
- [x] 在线/离线状态
- [x] 告警状态判断
- [x] 定时任务调度
- [x] API 接口

### Phase 2：增强功能 🔄
- [ ] WebSocket 实时推送
- [ ] 告警历史记录
- [ ] 自定义告警规则
- [ ] 阈值动态配置

### Phase 3：高级功能 📋
- [ ] 趋势预测算法
- [ ] 多设备分组统计
- [ ] 统计报表导出
- [ ] 移动端适配

---

## 📝 更新日志

### v1.0.1 (2024-01-27)

**新增内容**：
- 添加详细的定时任务时间线说明
- 添加 API 接口测试命令
- 添加故障排查指南
- 添加性能优化建议
- 添加时间线示例

**Bug 修复**：
- 修复 MqttModule 依赖注入问题
- 修复重复的 Logger 声明
- 添加 ScheduleModule 注册

### v1.0.0 (2024-01-15)

**初始版本**：
- 实现基础统计功能
- 实现告警判断算法
- 实现定时任务
- 实现前端集成

---

## 📞 技术支持

如有问题，请检查：
1. API 服务日志（终端输出）
2. 数据库连接状态
3. MQTT 服务状态
4. TimescaleDB 数据完整性

---

**文档版本**：v1.0.1
**最后更新**：2024-01-27
**维护者**：Development Team
