import mqtt from 'mqtt'

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
const MQTT_USERNAME = process.env.MQTT_USERNAME || ''
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || ''
const TOPIC = 'grouting-data-monitoring-topic'
const INTERVAL_MS = 1000

const snRingNumbers = {
  SN001: Array.from(
    { length: 12 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN002: Array.from(
    { length: 15 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN003: Array.from(
    { length: 10 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN004: Array.from(
    { length: 18 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN005: Array.from(
    { length: 8 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN006: Array.from(
    { length: 20 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN007: Array.from(
    { length: 14 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN008: Array.from(
    { length: 11 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN009: Array.from(
    { length: 16 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN010: Array.from(
    { length: 9 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN011: Array.from(
    { length: 13 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN012: Array.from(
    { length: 17 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN013: Array.from(
    { length: 10 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN014: Array.from(
    { length: 19 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
  SN015: Array.from(
    { length: 12 },
    (_, i) => `R${String(i + 1).padStart(3, '0')}`
  ),
}

const snList = Object.keys(snRingNumbers)

function randomInRange(min, max) {
  return Math.random() * (max - min) + min
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateMonitoringData(ringNumber, baseValue = 0) {
  const p1x = randomInRange(-50, 50) + baseValue
  const p1y = randomInRange(-100, 0) + baseValue
  const p7x = randomInRange(-50, 50) + baseValue
  const p7y = randomInRange(-100, 0) + baseValue
  const p3x = randomInRange(-30, 30) + baseValue
  const p3y = randomInRange(-50, 50) + baseValue
  const p5x = randomInRange(-30, 30) + baseValue
  const p5y = randomInRange(-50, 50) + baseValue
  const p9x = randomInRange(-20, 20) + baseValue
  const p9y = randomInRange(-80, -20) + baseValue

  const coc = p9y - randomInRange(10, 30)
  const hc = Math.abs(p1x - p7x)
  const sd = Math.abs(p9y - p3y)

  return {
    rn: ringNumber,
    '1x': parseFloat(p1x.toFixed(4)),
    '1y': parseFloat(p1y.toFixed(4)),
    '7x': parseFloat(p7x.toFixed(4)),
    '7y': parseFloat(p7y.toFixed(4)),
    '3x': parseFloat(p3x.toFixed(4)),
    '3y': parseFloat(p3y.toFixed(4)),
    '5x': parseFloat(p5x.toFixed(4)),
    '5y': parseFloat(p5y.toFixed(4)),
    '9x': parseFloat(p9x.toFixed(4)),
    '9y': parseFloat(p9y.toFixed(4)),
    coc: parseFloat(coc.toFixed(4)),
    hc: parseFloat(hc.toFixed(4)),
    sd: parseFloat(sd.toFixed(4)),
  }
}

function generatePayload() {
  const sn = snList[randomInt(0, snList.length - 1)]
  const ringNumbers = snRingNumbers[sn]

  const numRings = randomInt(1, Math.min(5, ringNumbers.length))
  const startIdx = randomInt(0, ringNumbers.length - numRings)
  const selectedRings = ringNumbers.slice(startIdx, startIdx + numRings)

  const baseValue = randomInRange(-20, 20)
  const data = selectedRings.map((rn) => generateMonitoringData(rn, baseValue))

  return {
    timestamp: Date.now(),
    sn: sn,
    data: data,
  }
}

function startPublisher() {
  const options = {
    clientId: `mqtt-tester-${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    connectTimeout: 10000,
    reconnectPeriod: 5000,
  }

  if (MQTT_USERNAME && MQTT_PASSWORD) {
    options.username = MQTT_USERNAME
    options.password = MQTT_PASSWORD
  }

  const client = mqtt.connect(MQTT_BROKER_URL, options)

  client.on('connect', () => {
    console.log(`\n✅ Connected to MQTT broker: ${MQTT_BROKER_URL}`)
    console.log(`📤 Publishing to topic: ${TOPIC}`)
    console.log(`⏱️  Interval: ${INTERVAL_MS}ms\n`)

    setInterval(() => {
      const payload = generatePayload()
      const message = JSON.stringify(payload)

      client.publish(TOPIC, message, { qos: 0 }, (err) => {
        if (err) {
          console.error(`❌ Publish error: ${err.message}`)
        } else {
          console.log(
            `[${new Date().toISOString()}] 📤 Sent: SN=${payload.sn}, Rings=${payload.data.map((d) => d.rn).join(',')}`
          )
        }
      })
    }, INTERVAL_MS)
  })

  client.on('error', (err) => {
    console.error(`❌ MQTT error: ${err.message}`)
  })

  client.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...')
  })

  client.on('close', () => {
    console.log('🔌 Connection closed')
  })
}

console.log('='.repeat(60))
console.log('  MQTT Tunnel Monitoring Data Tester')
console.log('='.repeat(60))
console.log(`Broker: ${MQTT_BROKER_URL}`)
console.log(`Topic: ${TOPIC}`)
console.log(`Interval: ${INTERVAL_MS}ms`)
console.log(`SN Count: ${snList.length}`)
console.log('='.repeat(60))

startPublisher()

process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping MQTT tester...')
  process.exit(0)
})
