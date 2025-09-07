import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
      {
        protocol: "http", 
        hostname: "wechatapppro-1252524126.file.myqcloud.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
    ]
  },
  experimental: {
    ppr: "incremental",
    after: true
  },
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: "bottom-right"
  },
  // 添加内存限制配置
  webpack: (config, { dev, isServer }) => {
    // 为生产构建增加内存限制
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // 减少并行处理，降低内存使用
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      }
    }
    return config
  },
  // 减少构建时的并行进程数
  experimental: {
    ...nextConfig.experimental,
    cpus: 1, // 限制使用的CPU核心数
  },
  // 禁用遥测数据收集，减少内存使用
  telemetry: { 
    disabled: true 
  }
}

// 修复 Sentry 配置
export default withSentryConfig(nextConfig, {
  org: "inspur-5o",
  project: "yc_directory",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  // 移除 hideSourceMaps，使用正确的配置
  sourcemaps: {
    disable: false, // 如果您想禁用 source maps
  },
  // 或者完全移除 sourcemaps 相关配置
});