import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [{ source: "/api/:path*", headers: [{ key: "access-control-allow-origin", value: "*" }, { key: "access-control-allow-methods", value: "GET, POST, PATCH" }] }];
  },
};

export default nextConfig;
