// @ts-nocheck
import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Turbopackのエラーを回避するための空設定
  experimental: {
    turbo: {},
  },
};

export default withPWA(nextConfig);
