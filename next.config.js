const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(
        new (require("webpack").IgnorePlugin)({
          resourceRegExp: /\.map$/,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
