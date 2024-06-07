// next.config.js
module.exports = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push('canvas'); // Exclude 'canvas' from client-side bundles
    }

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^canvas$/ // Ignore 'canvas' if needed in some contexts
      })
    );

    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
      options: {
        name: '[name].[ext]'
      }
    });

    return config;
  },
};
