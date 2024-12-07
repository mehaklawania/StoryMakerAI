/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

module.exports = {
    env: {
      NEXT_PUBLIC_GOOGLE_AI_KEY: process.env.NEXT_PUBLIC_GOOGLE_AI_KEY,
    },
  };