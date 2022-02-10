module.exports = {
  themeVars: {},
  webpack: {
    common: {
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
      main: {},
    },
  },
};
