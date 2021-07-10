// 把package 目录下的所有包都进行打包

const fs = require("fs");
const execa = require("execa"); //多进程打包
let res = fs.readdirSync("packages").filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false; //不是文件夹直接返回
  }
  return true;
});
// 并行打包
async function build(target) {
  // 子进程打包的信息共享给父进程
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], { stdio: "inherit" });
}

function runParallel(target, iteratorFn) {
  const res = [];
  for (const item in target) {
    const p = iteratorFn(target[item]);
    res.push(p);
  }
  return Promise.all(res);
}

runParallel(res, build);
