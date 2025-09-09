// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import fs from 'fs'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Layouts from 'vite-plugin-vue-layouts-next'
import Fonts from 'unplugin-fonts/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      VueRouter({ dts: 'src/typed-router.d.ts' }),
      Layouts(),
      AutoImport({
        imports: ['vue', VueRouterAutoImports, { pinia: ['defineStore', 'storeToRefs'] }],
        dts: 'src/auto-imports.d.ts',
        eslintrc: { enabled: true },
        vueTemplate: true,
      }),
      Components({ dts: 'src/components.d.ts' }),
      Vue({ template: { transformAssetUrls } }),
      Vuetify({ autoImport: true, styles: { configFile: 'src/styles/settings.scss' } }),
      Fonts({
        fontsource: {
          families: [{ name: 'Roboto', weights: [100, 300, 400, 500, 700, 900], styles: ['normal', 'italic'] }],
        },
      }),
    ],
    optimizeDeps: {
      exclude: [
        'vuetify',
        'vue-router',
        'unplugin-vue-router/runtime',
        'unplugin-vue-router/data-loaders',
        'unplugin-vue-router/data-loaders/basic',
      ],
    },
    define: { 'process.env': process.env },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      https: {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem'),
      },
      host: '0.0.0.0',
      port: 3000,
      hmr: {
        host: env.VITE_API_IP,
        port: 3000,
      },
    },
    css: {
      preprocessorOptions: {
        sass: { api: 'modern-compiler' },
        scss: { api: 'modern-compiler' },
      },
    },
  }
})
