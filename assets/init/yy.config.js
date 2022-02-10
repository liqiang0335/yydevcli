/**
 * ----------------------------------------
 * [@themeVars](https://ant.design/docs/react/customize-theme-cn)
 * [@HtmlWebpackPluginOption](https://github.com/jantimon/html-webpack-plugin#options)
 * ----------------------------------------
 */
module.exports = {
  common: {
    "@hash": true,
    "@themeVars": {
      "@primary-color": "#435ba3",
      "@border-radius-base": "2px",
    },
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
