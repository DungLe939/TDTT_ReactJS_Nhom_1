import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
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
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  // Với import thông thường thì nó cố gắng đọc như file js để tránh lâu thì ta để dòng lệnh dưới cho nó đỡ biên dịch.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
