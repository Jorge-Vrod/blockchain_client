const webpack = require("webpack");

module.exports = {
  devServer: {
    port: 3000, // Change the port to 3000
  },
  lintOnSave: false,
  configureWebpack: {
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        "chart.js": "chart.js/dist/Chart.js",
      },
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 6,
      }),
    ],
    devtool: 'source-map',
  },
  pwa: {
    name: "Vue Black Dashboard",
    themeColor: "#344675",
    msTileColor: "#344675",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "#344675",
  },
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false,
    },
  },
  css: {
    // Enable CSS source maps.
    sourceMap: process.env.NODE_ENV !== "production",
  },
};
