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
  // 移除可能导致 webpack 错误的实验性功能
  // experimental: {
  //   ppr: "incremental",
  //   after: true
  // },
  
  // 添加 webpack 配置来避免运行时错误
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
    }
    return config;
  },
  
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: "bottom-right"
  }
}

export default withSentryConfig(nextConfig, {
  org: "inspur-5o",
  project: "yc_directory",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  hideSourceMaps: true,
});