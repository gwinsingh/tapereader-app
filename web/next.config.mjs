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
      // Research notes (the blog): static pages in public/blog, built by scripts/blog/build.js from Markdown posts.
      // Files (assets, feed.xml) are served as they are; these rules give the pages clean addresses.
      { source: "/blog", destination: "/blog/index.html" },
      { source: "/blog/tags/:tag([a-z0-9-]+)", destination: "/blog/tags/:tag.html" },
      { source: "/blog/series/:id([a-z0-9-]+)", destination: "/blog/series/:id.html" },
      { source: "/blog/collections/:id([a-z0-9-]+)", destination: "/blog/collections/:id.html" },
      { source: "/blog/:slug([a-z0-9-]+)", destination: "/blog/:slug.html" },
    ];
  },
  async redirects() {
    return [
      // AI Buildout Atlas: a self-contained static site with relative links, so its address must end in a file name.
      { source: "/studies/ai-buildout-atlas", destination: "/studies/ai-buildout-atlas/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
