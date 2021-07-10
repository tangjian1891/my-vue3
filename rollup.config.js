import path, { resolve } from "path";
import json from "@rollup/plugin-json";
import ts from "rollup-plugin-typescript2";
import resolvePlugin from "@rollup/plugin-node-resolve";
// 根据环境变量中的target属性，获取对应模块中的package.json

// const packagesDir = path.resolve(__dirname, );//

const packageDir = path.resolve(__dirname, "packages", process.env.TARGET); //找到要打包的某个包
// 加载json文件

const pkg = require(path.resolve(packageDir, "package.json"));
const baseName = path.basename(packageDir);
const outputConfig = {
  "esm-bundler": {
    file: resolve(path.resolve(packageDir, "dist", baseName + ".esm-bundler.js")),
    format: "esm",
  },
  cjs: {
    file: resolve(path.resolve(packageDir, "dist", baseName + ".cjs.js")),
    format: "cjs",
  },
  global: {
    file: resolve(path.resolve(packageDir, "dist", baseName + ".global.js")),
    format: "iife",
  },
};

const options = pkg.buildOptions; //自定义的options选项

let arr = options.formats
  .map((formatName) => {
    //  存在就打包
    if (outputConfig[formatName]) {
      //  return   createConfig(formatName,outputConfig)
      return {
        ...outputConfig[formatName],
        name: options.name,
        sourcemap: true,
      };
    }
  })
  .filter(Boolean);
console.log(arr);
export default {
  input: resolve(path.resolve(packageDir, "src", "index.ts")),
  output: arr,
  plugins: [
    json(),
    ts({
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
    }),
    resolvePlugin(),
  ],
};
