import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";
import * as url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const tokenPath = path.resolve(__dirname, "../tokens");
const cachePath = path.resolve(tokenPath, "./cache/cache.json");

const cacheData = fs.readFileSync(cachePath, "utf8");

if (!cacheData) {
  throw new Error("⛔️ Cache data is empty");
}

console.log("📦 Generating token files...");

const cache = JSON.parse(cacheData);
const ref = cache.ref;
const sys = cache.sys;
const comp = cache.comp;

const refPath = path.resolve(tokenPath, "./core/ref.json");
const sysPath = path.resolve(tokenPath, "./core/sys.json");

fs.writeFileSync(
  refPath,
  await prettier.format(JSON.stringify(ref, null, 2), { parser: "json" }),
);

console.log("✅ Ref file generated");

fs.writeFileSync(
  sysPath,
  await prettier.format(JSON.stringify(sys, null, 2), { parser: "json" }),
);

console.log("✅ Sys file generated");

const componentKeys = Object.keys(comp);

for (const key of componentKeys) {
  const compPath = path.resolve(tokenPath, `./components/${key}.json`);
  const compData = {
    [key]: comp[key],
  };

  fs.writeFileSync(
    compPath,
    await prettier.format(JSON.stringify(compData, null, 2), {
      parser: "json",
    }),
  );

  console.log(`✅ ${key} file generated`);
}

console.log("🎉 Token files generated");
