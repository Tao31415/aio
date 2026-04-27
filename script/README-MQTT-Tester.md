# MQTT Tunnel Monitoring Data Tester

## 简介

这个脚本用于测试隧道监测 MQTT 数据的发送和接收。它模拟真实的传感器数据，随机选择设备 SN 和环号发送监测数据。

## 使用方法

### 1. 安装依赖

```bash
cd script
npm install
```

### 2. 配置环境变量（可选）

脚本会使用默认配置，你也可以通过环境变量覆盖：

```bash
# 设置 MQTT Broker URL
export MQTT_BROKER_URL=mqtt://localhost:1883

# 设置 MQTT 用户名（如果需要）
export MQTT_USERNAME=

# 设置 MQTT 密码（如果需要）
export MQTT_PASSWORD=
```

### 3. 运行脚本

```bash
node mqtt-tester.js
```

## 配置说明

### SN 和 Ring Number 配置

脚本默认配置了 15 个 SN，每个 SN 对应不同数量的 ring numbers：

- **SN001**: 12 个环 (R001-R012)
- **SN002**: 15 个环 (R001-R015)
- **SN003**: 10 个环 (R001-R010)
- **SN004**: 18 个环 (R001-R018)
- **SN005**: 8 个环 (R001-R008)
- **SN006**: 20 个环 (R001-R020)
- **SN007**: 14 个环 (R001-R014)
- **SN008**: 11 个环 (R001-R011)
- **SN009**: 16 个环 (R001-R016)
- **SN010**: 9 个环 (R001-R009)
- **SN011**: 13 个环 (R001-R013)
- **SN012**: 17 个环 (R001-R017)
- **SN013**: 10 个环 (R001-R010)
- **SN014**: 19 个环 (R001-R019)
- **SN015**: 12 个环 (R001-R012)

如需修改，编辑 `snRingNumbers` 对象。

### 发送间隔

默认每 5 秒发送一次数据。修改 `INTERVAL_MS` 变量可以改变间隔：

```javascript
const INTERVAL_MS = 5000 // 5秒
```

## 数据格式

发送的数据符合项目定义的 `TunnelMonitoringPayload` 接口：

```javascript
{
  timestamp: Number,  // Unix 时间戳（毫秒）
  sn: String,         // 设备序列号
  data: Array<{
    rn: String,      // Ring number (如 "R001")
    '1x': Number,    // 拱腰水平（左）
    '1y': Number,    // 拱腰沉降（左）
    '7x': Number,    // 拱腰水平（右）
    '7y': Number,    // 拱腰沉降（右）
    '3x': Number,    // 道床水平（左）
    '3y': Number,    // 道床沉降（左）
    '5x': Number,    // 道床水平（右）
    '5y': Number,    // 道床沉降（右）
    '9x': Number,    // 拱顶水平
    '9y': Number,    // 拱顶沉降
    coc: Number,     // 净空收敛
    hc: Number,      // 水平收敛
    sd: Number       // 沉降位移
  }>
}
```

## 验证数据

### 查看 API 返回的最新数据

```bash
curl.exe -s "http://localhost:30000/api/v1/mqtt/tunnel-monitoring/latest?limit=10"
```

### 按 SN 查询

```bash
curl.exe -s "http://localhost:30000/api/v1/mqtt/tunnel-monitoring?sn=SN001&limit=10"
```

### 按 Ring Number 查询

```bash
curl.exe -s "http://localhost:30000/api/v1/mqtt/tunnel-monitoring?ringNumber=R001&limit=10"
```

## 停止脚本

按 `Ctrl+C` 即可停止脚本。

## 示例输出

```
============================================================
  MQTT Tunnel Monitoring Data Tester
============================================================
Broker: mqtt://localhost:1883
Topic: grouting-data-monitoring-topic
Interval: 5000ms
SN Count: 15
============================================================

✅ Connected to MQTT broker: mqtt://localhost:1883
📤 Publishing to topic: grouting-data-monitoring-topic
⏱️  Interval: 5000ms

[2026-04-27T07:03:34.164Z] 📤 Sent: SN=SN012, Rings=R008,R009,R010
[2026-04-27T07:03:39.175Z] 📤 Sent: SN=SN001, Rings=R010,R011,R012
[2026-04-27T07:03:44.182Z] 📤 Sent: SN=SN008, Rings=R001,R002
[2026-04-27T07:03:49.190Z] 📤 Sent: SN=SN004, Rings=R016,R017
[2026-04-27T07:03:54.202Z] 📤 Sent: SN=SN006, Rings=R005,R006,R007
```

## 依赖

- Node.js >= 18
- npm
- mqtt (v5.15.1)
