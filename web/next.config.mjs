/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/4-week-challenge",
        destination: "/4-week-challenge/index.html",
      },
      {
        source: "/4-week-challenge/",
        destination: "/4-week-challenge/index.html",
      },
    ];
  },
};

export default nextConfig;
