import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiTarget = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Оптимизация памяти в dev режиме
  experimental: {
    // Отключаем тяжёлые проверки в dev
    webpackMemoryOptimizations: true,
  },
  // Отключаем TypeScript проверки в dev (запускать вручную при необходимости)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Отключаем source maps для экономии памяти
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
