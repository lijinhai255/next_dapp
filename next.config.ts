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
    cpus: 1 // 限制使用的CPU核心数
  },
  devIndicators: {
    position: "bottom-right"
  },
  // 增强内存限制配置
  webpack: (config, { dev, isServer }) => {
    // 为所有构建增加内存限制，不仅仅是生产构建
    config.optimization = {
      ...config.optimization,
      minimize: !dev, // 只在生产环境中最小化
      // 减少并行处理，降低内存使用
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    }
    
    // 限制并行处理
    if (!dev) {
      // 设置较小的 terser 并行数
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.parallel = 1; // 限制 terser 并行进程
          }
        });
      }
    }
    
    // 禁用源映射以减少内存使用
    if (!dev) {
      config.devtool = false;
    }
    
    return config;
  },
  // 禁用类型检查以减少内存使用
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 ESLint 以减少内存使用
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 减少输出信息
  output: 'standalone',
  // 禁用压缩可以减少内存使用，但会增加输出大小
  // 如果内存问题严重，可以考虑启用此选项
  // compress: false,
  poweredByHeader: false,
  reactStrictMode: false, // 关闭严格模式可能会减少一些内存使用
}

// 注意：从日志中看到有关 sentry.client.config.ts 的警告
// 建议将 Sentry 客户端配置移至 instrumentation-client.ts
const sentryWebpackPluginOptions = {
  org: "inspur-5o",
  project: "yc_directory",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  sourcemaps: {
    disable: true, // 禁用源映射以减少内存使用
  },
  telemetry: { 
    disabled: true 
  },
  // 减少构建时的内存使用
  hideSourceMaps: true,
  disableServerWebpackPlugin: true, // 如果不需要服务器端错误跟踪
  disableClientWebpackPlugin: false, // 保留客户端错误跟踪
}

// 修复 Sentry 配置
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);