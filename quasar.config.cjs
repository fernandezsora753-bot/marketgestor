const { configure } = require('quasar/wrappers')

module.exports = configure(function (ctx) {
  return {
    boot: ['firebase'],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },
      vueRouterMode: 'hash'
    },
    devServer: {
      open: true
    },
    framework: {
      config: {},
      plugins: ['Notify', 'Loading']
    },
    animations: []
  }
})
