// @ts-nocheck
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  typescript: {
    // Vercel上での型チェックをスキップしてビルド速度を上げ、エラー停止を防ぐ
    ignoreBuildErrors: true,
  },
  eslint: {
    // ビルド時のESLintチェックをスキップ
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
