const clip = require("copy-paste");
const fs = require("fs/promises");
const path = require("path");

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

  content = content.replace(/<svg.+?>/g, `<svg viewBox="0 0 ${w} ${h}" :width="size" :height="size">`);
  content = content.replace(/fill-opacity=".+?"/g, "");
  content = content.replace(/fill=".+?"/g, ":fill='fill'");
  content = content.replace(/>\s+</g, `><`);

  const target = `<template>${content}</template>
    <script>
    export default {
    props: {
        fill: {
            type: String,
            default: "#6B7280",
        },
        size: {
            type: Number,
            default: 24,
          },
    },
    };
    </script>`;

  const savePath = path.join(cwd, `${name}.vue`);
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
