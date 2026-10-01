import { dirname } from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { backendOrigin } from "./src/config/backend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  async rewrites() { return [{ source: "/api/v1/:path*", destination: `${backendOrigin()}/api/v1/:path*` }]; },
};

export default nextConfig;
