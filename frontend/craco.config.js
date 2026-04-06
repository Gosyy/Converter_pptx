const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    plugins: [new NodePolyfillPlugin()],
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        path: require.resolve("path-browserify"),
        stream: require.resolve("stream-browserify"),
        os: require.resolve("os-browserify/browser"),
        zlib: require.resolve("browserify-zlib"),
        https: require.resolve("https-browserify"),
      };
      return webpackConfig;
    },
  },
};
