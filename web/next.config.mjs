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
      // "Anatomy of a Drop" study: static pages in public/studies/market-drops (built by scripts/marketdrops)
      {
        source: "/studies/market-drops",
        destination: "/studies/market-drops/index.html",
      },
      {
        source: "/studies/market-drops/",
        destination: "/studies/market-drops/index.html",
      },
    ];
  },
};

export default nextConfig;
