import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";
import * as url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const tokenPath = path.resolve(__dirname, "../tokens");
const corePath = path.resolve(tokenPath, "./core");
const compPath = path.resolve(tokenPath, "./components");
const cachePath = path.resolve(tokenPath, "./cache/cache.json");

// check if cache file exists
if (!fs.existsSync(cachePath)) {
  console.log("❌ Cache file not found");
  process.exit(1);
}

// clear corePath files and compPath files
console.log("🗑️ Clear exist files");
fs.rmSync(corePath, { recursive: true });
fs.rmSync(compPath, { recursive: true });

console.log("📦 Generating token files...");

const cacheData = fs.readFileSync(cachePath, "utf8");
const cache = JSON.parse(cacheData);
const ref = cache.ref;
const sys = cache.sys;
const comp = cache.comp;

const refPath = path.resolve(corePath, "./ref.json");
const sysPath = path.resolve(corePath, "./sys.json");

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
  const compTokenPath = path.resolve(compPath, `./${key}.json`);
  const compData = {
    [key]: comp[key],
  };

  fs.writeFileSync(
    compTokenPath,
    await prettier.format(JSON.stringify(compData, null, 2), {
      parser: "json",
    }),
  );

  console.log(`✅ ${key} file generated`);
}

console.log("🎉 Token files generated");

// delete cache dir
fs.rmSync(path.resolve(tokenPath, "./cache"), { recursive: true });
