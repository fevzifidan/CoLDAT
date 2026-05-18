import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // ONNX dosyalarını doğru MIME type ile serve et
    {
      name: 'onnx-mime-types',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.onnx') || req.url?.endsWith('.onnx.data')) {
            res.setHeader('Content-Type', 'application/octet-stream');
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // WASM ve ONNX dosyalarının doğru MIME türüyle serve edilmesi için
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  assetsInclude: ['**/*.onnx', '**/*.onnx.data', '**/*.wasm'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  worker: {
    format: 'es',
  },
})

