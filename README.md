# yydevcli

基于 `Webpack 5` 的自用打包库

## 安装

```shell
npm i -g yydevcli # 全局安装
npm i -D yydevcli # 本地安装
```

## 配置选项

- 路径均为相对根目录
- style/var.scss = scss 全局变量 (无需引入)
- style/theme.json = antd 主题文件 (无需引入)

## `yy.config.js`

- `webpack`: webpack 配置选项
  - `webpack.common`: 多页面打包的通用配置
  - `webpack.pages`: 每个页面的具体配置(根据入口文件夹名称)
- `hash=true`: 文件是否增加哈希值
- `themeVars={}`: 可配置 antd 主题选项

## other

- `style/var.scss`: 配置 scss 全局变量
