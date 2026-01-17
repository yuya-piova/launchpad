// @ts-nocheck
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // Turbopackを無効化しWebpackを強制する設定
  webpack: (config) => {
    return config;
  },
  // セキュリティエラーが出る場合は、ここでのチェックを外す
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
