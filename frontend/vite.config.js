import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const proxyPaths = [
  "/auth",
  "/land",
  "/credits",
  "/earnings",
  "/market",
  "/marketplace",
  "/farmer",
  "/admin",
  "/health"
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const proxyTarget = (env.VITE_PROXY_TARGET || env.VITE_API_BASE_URL || "http://127.0.0.1:8001").replace(/\/$/, "")

  const proxy = Object.fromEntries(
    proxyPaths.map((path) => [
      path,
      {
        target: proxyTarget,
        changeOrigin: true,
        secure: false
      }
    ])
  )

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: [
        "nonfelonious-adrianna-unjestingly.ngrok-free.dev"
      ],
      proxy
    }
  }
})
