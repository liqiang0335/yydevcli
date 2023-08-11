/**
 * ----------------------------------------
 * [doc](https://github.com/liqiang0335/yydevcli)
 * [@HtmlWebpackPluginOption](https://github.com/jantimon/html-webpack-plugin#options)
 * ----------------------------------------
 */
module.exports = {
  common: {
    "@hash": false,
    "@HtmlWebpackPluginOption": {
      filename: "index.html",
    },
    resolve: {
      alias: {
        "@store": "./main/store",
        "@script": "./main/script",
        "@comps": "./main/component",
        "@const": "./main/constant",
        "@hook": "./main/hook",
      },
    },
    devServer: {
      host: "127.0.0.1",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://www.xxx.com",
          pathRewrite: { "^/mydev": "" },
          changeOrigin: true,
        },
      },
    },
  },
  pages: {
    login: {
      "@HtmlWebpackPluginOption": { filename: "login.html" },
    },
  },
};
