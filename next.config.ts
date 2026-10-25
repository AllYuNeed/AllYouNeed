import type { NextConfig } from "next";
import { assertNoPrivilegedKeys } from "./lib/supabase/config";

// Fail the build / dev server if a secret was put in a NEXT_PUBLIC_ variable (it would be published to every visitor).
assertNoPrivilegedKeys(process.env);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
