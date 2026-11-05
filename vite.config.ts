import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|victory-vendor|d3-[^\\/]+|internmap)[\\/]/,
              priority: 20,
            },
            {
              name: 'pdf-canvas',
              test: /[\\/]node_modules[\\/](html2canvas-pro|html2canvas|canvg|raf|rgbcolor|stackblur-canvas|svg-pathdata)[\\/]/,
              maxSize: 350_000,
              priority: 20,
            },
            {
              name: 'pdf-generator',
              test: /[\\/]node_modules[\\/](jspdf|fast-png|fflate|iobuffer|pako)[\\/]/,
              maxSize: 350_000,
              priority: 20,
            },
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 10,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              minSize: 20_000,
              maxSize: 400_000,
              priority: 1,
            },
          ],
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
