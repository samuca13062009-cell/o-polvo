/* Junta o site num único ficheiro HTML (e o painel noutro): `node build-single.js`.
   Sem servidor, as reservas ficam guardadas apenas no browser (modo de demonstração). */
"use strict";
const fs = require("fs");
const path = require("path");

const PUB = path.join(__dirname, "public");
const OUT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(PUB, f), "utf8");

// As fontes vão dentro do ficheiro, para funcionar sem servidor e sem rede
function inlineFonts(css) {
  return css.replace(/url\("\.\.\/(fonts\/[^"]+\.woff2)"\)/g, (_, f) =>
    'url("data:font/woff2;base64,' + fs.readFileSync(path.join(PUB, f)).toString("base64") + '")');
}

function bundle(page, renames) {
  let html = read(page);
  html = html.replace(/<link rel="preload" href="fonts\/[^"]+"[^>]*>\n?/g, "");
  html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, f) => "<style>\n" + inlineFonts(read(f)) + "</style>");
  html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, f) => "<script>\n" + read(f).replace(/<\/script/gi, "<\\/script") + "</script>");
  Object.keys(renames).forEach((from) => { html = html.split(from).join(renames[from]); });
  return html;
}

const names = { "index.html": "o-polvo.html", "admin.html": "o-polvo-admin.html" };
Object.keys(names).forEach((page) => {
  const file = path.join(OUT, names[page]);
  fs.writeFileSync(file, bundle(page, names));
  console.log(names[page] + "  " + Math.round(fs.statSync(file).size / 1024) + " KB");
});
