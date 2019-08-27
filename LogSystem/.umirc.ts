export default {
  plugins: [
    ['umi-plugin-block-dev', {
      layout: 'ant-design-pro',
      menu: {
        name: '操作日志',
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
  lessLoaderOptions:{
    module: {
      rules: [
        {
          test: /\.less$/,
          loader: 'less-loader', // compiles Less to CSS
        },
      ],
    },
  },
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8080/api',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    }
  },
}