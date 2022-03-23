# yydevcli

基于 `Webpack 5` 的自用打包库

## `yy.config.js`

### webpack 选项设置

- `common`: 多页面打包的通用 webpack 配置
- `pages`: 每个页面的具体 webpack 配置(根据入口文件夹名称)

### 自定义设置(@开头)

- `@hash=true`: 文件是否增加哈希值
- `@themeVars: Object`: 可配置 antd 主题选项
- `@HtmlWebpackPluginOption: Object`: HTML 模版配置
- `@browsers": ["chrome >= 60"]` babelOption
- `@cssModules": true`

### 其他

- `style/var.scss`: 配置 scss 全局变量
