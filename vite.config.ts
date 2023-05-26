import { resolve } from "path";
import { ConfigEnv, loadEnv, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import legacy from "@vitejs/plugin-legacy";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import WindiCSS from "vite-plugin-windicss";
import checker from "vite-plugin-checker";
import DefineOptions from "unplugin-vue-define-options/vite";
import postcsspxtoviewport from "postcss-px-to-viewport";
import vitePluginString from 'vite-plugin-string'
const CWD = process.cwd();

const prefix = `monaco-editor/esm/vs`;

// https://cn.vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  // 环境变量
  const { VITE_BASE_URL } = loadEnv(mode, CWD);
  return {
    base: VITE_BASE_URL, // 设置打包路径
    css: {
      modules: {
        localsConvention: "camelCase", // 默认只支持驼峰，修改为同时支持横线和驼峰
      },
      preprocessorOptions: {
        scss: {
          charset: false,
        },
        less: {
          charset: false,
        },
      },
      // TODO 构建包含@charset问题 https://github.com/vitejs/vite/issues/5833
      // charset: false,
      postcss: {
        plugins: [
          postcsspxtoviewport({
            unitToConvert: "px", // 要转化的单位
            viewportWidth: 750, // UI设计稿的宽度
            unitPrecision: 6, // 转换后的精度，即小数点位数
            propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
            viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
            fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
            selectorBlackList: ["ignore-"], // 指定不转换为视窗单位的类名，
            minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
            mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
            replace: true, // 是否转换后直接更换属性值
            // exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
            exclude: [],
            landscape: false, // 是否处理横屏情况
          }),
        ],
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      WindiCSS(),
      // https://github.com/sxzz/unplugin-vue-define-options
      DefineOptions(),
      legacy({
        targets: ["defaults", "not IE 11"],
      }),
      // https://github.com/antfu/unplugin-auto-import#readme
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        dts: true,
        imports: ["vue", "vue-router"],
      }),
      vitePluginString()
      // https://github.com/fi3ework/vite-plugin-checker
      // checker({
      //   typescript: true,
      //   // vueTsc: true,
      //   eslint: {
      //     lintCommand: 'eslint "./src/**/*.{.vue,ts,tsx}"', // for example, lint .ts & .tsx
      //   },
      // }),
    ],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "./src"),
        },
      ],
    },
    build: {
      cssCodeSplit: true, // 如果设置为false，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      sourcemap: false, // 构建后是否生成 source map 文件。如果为 true，将会创建一个独立的 source map 文件
      target: "modules", // 设置最终构建的浏览器兼容目标。默认值是一个 Vite 特有的值——'modules'  还可设置为 'es2015' 'es2016'等
      chunkSizeWarningLimit: 550, // 单位kb  打包后文件大小警告的限制 (文件大于此此值会出现警告)
      assetsInlineLimit: 4096, // 单位字节（1024等于1kb） 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项。
      minify: "terser", // 'terser' 相对较慢，但大多数情况下构建后的文件体积更小。'esbuild' 最小化混淆更快但构建后的文件相对更大。
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境去除console
          drop_debugger: true, // 生产环境去除debugger
        },
      },
      outDir: 'dist/running',
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },
    optimizeDeps: {
      include: [
        "@vueuse/core",
        "lodash-es",
        "vuedraggable",
      ],
    },
    server: {
      host: "0.0.0.0",
      port: 10082, // 设置服务启动端口号
      open: false, // 设置服务启动时是否自动打开浏览器
      cors: true, // 允许跨域
      // 设置代理，根据项目实际情况配置
      proxy: {
        '/media': {
          target: 'https://dhudong.cztv.com/media/latest',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/media/, '')
        },
      },
    },
  };
};
