export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky', // 使用浅蓝色板
      neutral: 'slate',
    },
    icons: {
      light: 'i-ph-sun',
      dark: 'i-ph-moon',
    },
    // 按钮全局配置
    button: {
      defaultVariants: {
        color: 'primary',
        variant: 'solid',
        size: 'md',
      },
      defaultProps: {
        loadingIcon: 'i-lucide-loader-circle',
      },
    },
    // 卡片的默认样式
    card: {
      defaultVariants: {
        variant: 'default',
      },
    },
    // 焦点环配置
    ring: {
      active: 'primary',
    },
    // Toast 通知位置
    toaster: {
      position: 'bottom-right',
      expand: false,
      duration: 5000,
    },
  },
})
