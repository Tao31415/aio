/**
 * MQTT 测试数据发送器
 * 在 Docker 容器中运行: docker exec deploy-mosquitto-1 node /tmp/mqtt-test-sender.js
 * 每秒发送一条完整的测试数据，持续 3 分钟
 */

const mqtt = require('mqtt')

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
const TOPIC = 'grouting-data-monitoring-topic'
const DURATION_MS = 3 * 60 * 1000 // 3 分钟
const INTERVAL_MS = 1000 // 1 秒

// 定义多个设备配置
const DEVICES = [
  { sn: 'DEVICE-001', rings: ['R101', 'R102', 'R103'] },
  { sn: 'DEVICE-002', rings: ['R201', 'R202'] },
  { sn: 'DEVICE-003', rings: ['R301', 'R302', 'R303', 'R304'] },
]

function randomFloat(min, max, decimals = 3) {
  const val = min + Math.random() * (max - min)
  return parseFloat(val.toFixed(decimals))
}

function generateDataItem(ringNumber, index) {
  return {
    rn: ringNumber,
    '1x': randomFloat(100, 300),
    '1y': randomFloat(-100, 100),
    '7x': randomFloat(100, 300),
    '7y': randomFloat(-100, 100),
    '3x': randomFloat(50, 200),
    '3y': randomFloat(-50, 50),
    '5x': randomFloat(50, 200),
    '5y': randomFloat(-50, 50),
    '9x': randomFloat(150, 350),
    '9y': randomFloat(-150, 50),
    coc: randomFloat(-20, 20),
    hc: randomFloat(0, 15),
    sd: randomFloat(-10, 10),
  }
}

function generatePayload(deviceIndex, tick) {
  const device = DEVICES[deviceIndex % DEVICES.length]
  const timestamp = Date.now()

  // 每个设备发送不同数量和内容的数据
  const data = device.rings.map((ring, idx) => {
    // 根据 tick 添加一些变化
    return generateDataItem(ring, tick + idx)
  })

  return {
    timestamp,
    sn: device.sn,
    data,
  }
}

async function main() {
  console.log(`MQTT Test Sender starting...`)
  console.log(`Broker: ${BROKER_URL}`)
  console.log(`Topic: ${TOPIC}`)
  console.log(`Duration: ${DURATION_MS / 1000}s`)
  console.log(`Interval: ${INTERVAL_MS}ms`)
  console.log('')

  const client = mqtt.connect(BROKER_URL, {
    clientId: `mqtt-tester-${Date.now()}`,
    clean: true,
    reconnectPeriod: 0, // 不重连，测试结束后直接退出
  })

  let sentCount = 0
  let tick = 0
  let startTime = Date.now()

  await new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log(`[${new Date().toISOString()}] Connected to broker`)

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime

        if (elapsed >= DURATION_MS) {
          clearInterval(interval)
          console.log(
            `\n[Test completed] Sent ${sentCount} messages in ${DURATION_MS / 1000}s`
          )
          client.end()
          resolve()
          return
        }

        // 轮换设备
        const deviceIndex = Math.floor(elapsed / INTERVAL_MS) % DEVICES.length
        const payload = generatePayload(deviceIndex, tick)
        const message = JSON.stringify(payload)

        client.publish(TOPIC, message, { qos: 1 }, (err) => {
          if (err) {
            console.error(`[ERROR] Publish failed: ${err.message}`)
          } else {
            const timeStr = new Date().toISOString().split('T')[1].slice(0, 12)
            console.log(
              `[${timeStr}] [${sentCount}] SN=${payload.sn} rings=${payload.data.length} ts=${payload.timestamp}`
            )
            sentCount++
          }
        })

        tick++
      }, INTERVAL_MS)
    })

    client.on('error', (err) => {
      console.error(`[ERROR] Connection error: ${err.message}`)
      reject(err)
    })

    client.on('close', () => {
      console.log('[INFO] Connection closed')
    })
  })

  console.log('MQTT Test Sender exiting...')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
