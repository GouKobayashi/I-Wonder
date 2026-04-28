import type { NextConfig } from "next";
import path from "path";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const { protocol, hostname, port } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
      port,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // Ignore invalid env values and fall back to no remote patterns.
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
