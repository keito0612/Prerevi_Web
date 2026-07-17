import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers用（@opennextjs/cloudflareを使用）
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopack設定（Next.js 16ではデフォルトで有効）
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Webpack設定（フォールバック用）
  webpack: (config) => {
    let modularizeImports = null;
    config.module.rules.some((rule: { oneOf: any[]; }) =>
      rule.oneOf?.some((oneOf: { use: { options: { nextConfig: { modularizeImports: any; }; }; }; }) => {
        modularizeImports =
          oneOf?.use?.options?.nextConfig?.modularizeImports;
        return modularizeImports;
      }),
    );
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
          },
        },
      ],
    });
    if (modularizeImports?.["@headlessui/react"]) {
      delete modularizeImports["@headlessui/react"];
    }
    return config;
  },
  images: {
    disableStaticImages: true,
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日間キャッシュ
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

// OpenNext Cloudflare開発環境用の初期化
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
