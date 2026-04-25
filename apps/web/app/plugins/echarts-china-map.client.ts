/**
 * 注册中国地图 GeoJSON 数据
 * 该插件在客户端加载地图数据，避免组件渲染时地图未注册的问题
 */
export default defineNuxtPlugin(async () => {
  try {
    // 加载中国地图 GeoJSON
    const response = await fetch(
      'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
    )
    const chinaGeoJSON = await response.json()

    // 动态导入 echarts core
    const echarts = await import('echarts/core').then(m => m.default || m)

    // 注册地图
    echarts.registerMap('china', chinaGeoJSON)
    console.log('中国地图 GeoJSON 注册成功')
  } catch (error) {
    console.error('注册中国地图失败:', error)
  }
})
