import type { NextConfig } from "next";

// Адрес API для прокси /api/* (на Vercel — домен Railway).
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Браузер ходит в API через сайт: cookie входа ставится для домена сайта,
  // и её видят и запросы из браузера, и серверные страницы.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
