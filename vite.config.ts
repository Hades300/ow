import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from  "tailwindcss"
import autoprefixer from "autoprefixer"

export default defineConfig({
    base: '/',
    mode: 'production',
    plugins: [
        react()
    ],
    css: {
        postcss: {
            plugins: [
                tailwindcss(),
                autoprefixer()
            ]
        }
    },
    build: {
        cssCodeSplit: true,
        terserOptions: {
            compress: {
                drop_console: true, // 生产环境下去除console
                drop_debugger: true, // 生产环境下去除debugger
            }
        },
        assetsDir: 'assets', // 指定生成静态资源的存放路径,相对于outDir
        assetsInlineLimit: 4096,// 小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。
        sourcemap: false, // 是否生成map文件
        reportCompressedSize: true, //  gzip 压缩大小报告。
        rollupOptions: {
            plugins: [
                
            ],
            output: {
                chunkFileNames: 'vendor/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: '[ext]/[name]-[hash].[ext]',
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'lodash': ['lodash-es'],
                },
            },
        }
    },
});