import { configure } from 'quasar/wrappers'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default configure(function (ctx) {
  return {
    boot: [],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },
      vueRouterMode: 'hash',
      extendViteConf (viteConf) {
        viteConf.resolve.alias = {
          ...viteConf.resolve.alias,
          '@': path.resolve(__dirname, './src')
        }
      }
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