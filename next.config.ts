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
    // 移除 ppr 配置，因为它只能在 canary 版本中使用
    // 移除 after 配置，因为它现在默认可用
    cpus: 1 // 限制使用的CPU核心数
  },
  devIndicators: {
    // 移除已弃用的 appIsrStatus
    // 移除已弃用的 buildActivity
    position: "bottom-right" // 更新为新的命名
  },
  // 添加内存限制配置
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // 将 telemetry 配置移动到正确的位置
}

// 禁用遥测数据收集，减少内存使用
const sentryWebpackPluginOptions = {
  org: "inspur-5o",
  project: "yc_directory",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  sourcemaps: {
    disable: false, // 如果您想禁用 source maps
  },
  // telemetry 配置应该在这里
  telemetry: { 
    disabled: true 
  }
};

// 修复 Sentry 配置
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
