/** @type {import('next').NextConfig} */


const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_AI_KEY: process.env.NEXT_PUBLIC_GOOGLE_AI_KEY,
  },
};

export default nextConfig;
