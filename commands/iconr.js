const clip = require("copy-paste");
const fs = require("fs/promises");
const path = require("path");

/***
 * 创建SVG组件:内容从剪贴板获取
 * yy iconr [iconname]
 */
async function main(ctx) {
  const { cwd } = ctx;
  const name = "SVG" + process.argv[3];

  let content = await paste();
  content = content.replace(/\n+/g, "");
  content = content.replace(/^.+<svg version/g, "<svg version");

  const matchW = content.match(/width="([\d.]+)"/);
  const matchH = content.match(/height="([\d.]+)"/);
  const w = matchW[1];
  const h = matchH[1];

  content = content.replace(/<svg.+?>/g, `<svg viewBox="0 0 ${w} ${h}" width={size} height={size}>`);
  content = content.replace(/fill-opacity=".+?"/g, "");
  content = content.replace(/fill=".+?"/g, "fill={fill}");
  content = content.replace(/>\s+</g, `><`);

  const target = `import React from "react";
  export default function ${name}({ fill="#000", size=30 }) {
    return (
      ${content}
    );
  }`;

  const savePath = path.join(cwd, `${name}.tsx`);
  await fs.writeFile(savePath, target);

  console.log(`OK: ${savePath}`);
}

function paste() {
  return new Promise((resolve, reject) => {
    clip.paste(function (err, text) {
      if (err) {
        reject(err);
      }
      resolve(text);
    });
  });
}

module.exports = main;
