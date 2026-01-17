// @ts-nocheck
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // 必要最小限の設定
  reactStrictMode: true,
};

export default withPWA(nextConfig);
