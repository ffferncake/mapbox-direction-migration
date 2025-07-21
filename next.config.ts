import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ 여기에 추가
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 다른 옵션도 여기에 추가 가능
};

export default nextConfig;
