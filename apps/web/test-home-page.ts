import { chromium, Browser, Page } from 'playwright'

async function testHomePage() {
  let browser: Browser | null = null

  try {
    console.log('🚀 启动浏览器...')
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page: Page = await context.newPage()

    // 监听控制台消息
    page.on('console', (msg) => {
      const type = msg.type()
      if (type === 'error' || type === 'warning') {
        console.log(`[${type.toUpperCase()}] ${msg.text()}`)
      }
    })

    // 监听页面错误
    page.on('pageerror', (error) => {
      console.log(`[PAGE ERROR] ${error.message}`)
    })

    // 监听网络请求
    page.on('requestfailed', (request) => {
      console.log(
        `[NETWORK ERROR] ${request.url()} - ${request.failure()?.errorText}`
      )
    })

    console.log('📍 导航到 /home 页面...')
    await page.goto('http://localhost:40000/home', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    console.log('✅ 页面加载完成')

    // 等待一下让动态内容加载
    await page.waitForTimeout(2000)

    // 1. 检查页面标题
    const title = await page.title()
    console.log(`📄 页面标题: ${title}`)

    // 2. 检查设备列表
    const deviceListItems = await page.locator('nav li').count()
    console.log(`📋 设备列表项数量: ${deviceListItems}`)

    // 3. 检查统计卡片
    const statCards = await page.locator('.rounded-lg.p-4.text-white').count()
    console.log(`📊 统计卡片数量: ${statCards}`)

    // 4. 检查 tabs
    const tabs = await page.locator('nav a[href*="/home/"]').count()
    console.log(`🏷️ Tabs 数量: ${tabs}`)

    // 5. 检查当前激活的 tab
    const activeTab = await page
      .locator('nav a[href*="/home/"].bg-primary')
      .first()
    const activeTabHref = await activeTab.getAttribute('href')
    console.log(`✅ 当前激活的 Tab: ${activeTabHref}`)

    // 6. 截取页面截图
    await page.screenshot({
      path: 'test-screenshots/home-page-initial.png',
      fullPage: true,
    })
    console.log('📸 截图已保存: test-screenshots/home-page-initial.png')

    // 7. 检查 URL
    const currentUrl = page.url()
    console.log(`🔗 当前 URL: ${currentUrl}`)

    // 8. 检查是否有设备被选中
    const selectedDevice = await page.locator('nav li a.bg-primary').first()
    const selectedDeviceText = await selectedDevice.textContent()
    console.log(`🎯 选中的设备: ${selectedDeviceText?.trim()}`)

    // 9. 检查右侧内容区域
    const rightContent = await page.locator('main').first()
    const contentText = await rightContent.textContent()
    console.log(`📝 右侧内容区域内容: ${contentText?.slice(0, 200)}...`)

    // 10. 点击设备信息 tab
    console.log('\n🔄 点击设备信息 Tab...')
    const deviceTab = await page.locator('a[href*="/home/device"]').first()
    const deviceTabHref = await deviceTab.getAttribute('href')
    console.log(`   设备信息 Tab href: ${deviceTabHref}`)

    await deviceTab.click()
    await page.waitForTimeout(1000)

    // 11. 再次检查 URL
    const newUrl = page.url()
    console.log(`🔗 点击后 URL: ${newUrl}`)

    // 12. 检查选中状态是否保持
    const stillSelectedDevice = await page
      .locator('nav li a.bg-primary')
      .first()
    const stillSelectedText = await stillSelectedDevice.textContent()
    console.log(`🎯 点击后选中的设备: ${stillSelectedText?.trim()}`)

    // 13. 截图
    await page.screenshot({
      path: 'test-screenshots/home-page-after-tab-click.png',
      fullPage: true,
    })
    console.log('📸 截图已保存: test-screenshots/home-page-after-tab-click.png')

    // 14. 检查设备详情内容
    const deviceDetail = await page
      .locator('.font-semibold:has-text("设备基本信息")')
      .first()
    const deviceDetailVisible = await deviceDetail
      .isVisible()
      .catch(() => false)
    console.log(`📋 设备详情可见: ${deviceDetailVisible}`)

    // 15. 获取设备详情文本
    const deviceInfoSection = await page.locator('text=设备基本信息').first()
    const parentElement = await deviceInfoSection
      .locator('..')
      .locator('..')
      .first()
    const deviceInfoText = await parentElement.textContent().catch(() => '')
    console.log(`📝 设备信息内容:\n${deviceInfoText?.slice(0, 500)}`)

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
