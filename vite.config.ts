import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const scanApiUrl = (env.VITE_SCAN_API_URL || '').trim()

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        /* 
        Cấu hình alias để có thể sử dụng '@' để truy cập vào thư mục 'src'
        Example: import MyComponent from '@/components/MyComponent'
        Instead of: import MyComponent from '../../common/components/MyComponent'
        */
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      allowedHosts: true, // Cho phép truy cập từ link public (localtunnel, ngrok, pinggy)
      proxy: scanApiUrl
        ? {
          '/scan-api': {
            target: scanApiUrl,
            changeOrigin: true,
            secure: true,
            headers: {
              'X-Pinggy-No-Screen': 'true',
            },
            timeout: 180000,
            proxyTimeout: 180000,
            rewrite: (pathValue) => pathValue.replace(/^\/scan-api/, ''),
          },
        }
        : undefined,
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    // Với import thông thường thì nó cố gắng đọc như file js để tránh lâu thì ta để dòng lệnh dưới cho nó đỡ biên dịch.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
