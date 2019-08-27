export default {
  plugins: [
    ['umi-plugin-block-dev', {
      layout: 'ant-design-pro',
      menu: {
        name: '登录日志',
        icon: 'home',
      },
    }],
    [
      'umi-plugin-react',
      {
        dva: true,
        locale: true,
        antd: true,
      },
    ],
  ],
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8080/api',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    }
  },
}
