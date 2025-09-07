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