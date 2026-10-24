import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin/content',
        destination: '/admin/website-content',
        permanent: true,
      },
      {
        source: '/admin/activity',
        destination: '/admin/activity-log',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
