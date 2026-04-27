import { chromium } from 'playwright'

async function testHomePage() {
  let browser = null

  try {
    console.log('🚀 启动浏览器...')
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    const consoleLogs = []
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push(`[${msg.type()}] ${text}`)
      if (msg.type() === 'error') {
        console.log(`[ERROR] ${text}`)
      }
    })

    console.log('📍 导航到 /home 页面...')
    await page.goto('http://localhost:40000/home', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    await page.waitForTimeout(3000)

    console.log('✅ 页面加载完成')

    const currentUrl = page.url()
    console.log(`🔗 当前 URL: ${currentUrl}`)

    const title = await page.title()
    console.log(`📄 页面标题: ${title}`)

    const bodyHtml = await page.evaluate(() => document.body.innerHTML)
    console.log(`📝 Body HTML 长度: ${bodyHtml.length} 字符`)

    const hasBrandName = bodyHtml.includes('隧道') || bodyHtml.includes('AIO')
    console.log(`🏷️ 包含品牌名称: ${hasBrandName}`)

    const hasStats = bodyHtml.includes('设备总数')
    console.log(`📊 包含统计数据: ${hasStats}`)

    const hasDeviceTab = bodyHtml.includes('设备信息')
    console.log(`🏷️ 包含设备信息 Tab: ${hasDeviceTab}`)

    const hasDeviceList = bodyHtml.includes('设备列表')
    console.log(`📋 包含设备列表: ${hasDeviceList}`)

    const nuxtHtml = await page.evaluate(() => {
      const nuxt = document.querySelector('#__nuxt')
      return nuxt ? nuxt.innerHTML.slice(0, 1000) : '未找到 #__nuxt'
    })
    console.log(`🔍 Nuxt App HTML:\n${nuxtHtml}`)

    await page.screenshot({
      path: 'test-screenshots/home-debug.png',
      fullPage: false,
    })
    console.log('📸 截图已保存: test-screenshots/home-debug.png')

    if (consoleLogs.length > 0) {
      console.log('\n📜 控制台日志:')
      consoleLogs.forEach((log) => console.log(`  ${log}`))
    }

    console.log('\n✅ 测试完成！')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    throw error
  } finally {
    if (browser) {
      await browser.close()
      console.log('🔒 浏览器已关闭')
    }
  }
}

testHomePage().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
