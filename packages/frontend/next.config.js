/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output in production builds
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/.well-known/:path*",
        destination: `${apiUrl}/.well-known/:path*`,
      },
      {
        source: "/nodeinfo/:path*",
        destination: `${apiUrl}/nodeinfo/:path*`,
      },
      {
        source: "/ap/:path*",
        destination: `${apiUrl}/ap/:path*`,
      },
    ];
  },
  typescript: {
    // Already handled by tsc in build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint runs separately
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
