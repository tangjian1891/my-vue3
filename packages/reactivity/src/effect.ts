import { TriggerOrTypes } from "./operators";

export function effect(fn, options: any = {}) {
  // 我需要放这个effect变成effect，可以做到数据变化重新执行

  const effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect(); //响应式的efffect默认会执行一次
  }

  return effect;
}
let uid = 0;
let activeEffect;
const effectStack = []; //栈，避免嵌套effect，导致effectFn变化
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect); //将依赖函数收集起来
        activeEffect = effect; //当前的依赖放到第三方变量
        return fn(); //正常返回执行函数
      } finally {
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect.id = uid++;
  effect._isEffect = true; //用于标识这个是响应式effect
  effect.raw = fn; //原函数
  effect.options = options; //挂载属性
  return effect;
}

const targetMap = new WeakMap();
// 在内部执行get属性时，会触发get，内部有触发track
export function track(target, type, key) {
  activeEffect;
  console.log(target, type, activeEffect);
  if (activeEffect === undefined) {
    return; //此属性不用收集
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  //

  let dep = depsMap.get(key); //是有这个
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

export function trigger(target, type, key?, newVal?, oldVale?) {
  console.log(target, type, key, newVal, oldVale);
  console.log("触发啊啊啊啊啊");
  // 如果这个属性没有收集过effect,那不需要做任何操作
  let depsMap = targetMap.get(target);
  // 如果没有依赖，直接跳过
  if (!depsMap) {
    return;
  }

  const effects = new Set(); //当前值变化的所有依赖全部收入
  // 我要将所有的 要执行的effecct全部存到一个新的集合,一起执行
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      // 依赖数组
      effectsToAdd.forEach((effect) => {
        effects.add(effect);
      });
    }
  };
  // 1. 看修改的是不是数组的长度,改长度影响很大
  if (key === "length" && Array.isArray(target)) {
    // 如果对应的长度有依赖收集需要更新
    depsMap.forEach((dep, key) => {
      console.log(depsMap, dep, key);
      // 如果修改的是索引。 那么需要当前key值和现在的索引设值对比，arr.length=1
      if (key === "length" || key > newVal) {
        // 如果更改的长度，小于收集的索引，那么这个索引也需要触发effect重新执行
        add(dep);
      }
    });
  } else {
    // 可能是对象。 收集过，直接触发
    if (key !== undefined) {
      add(depsMap.get(key));//如果是
    }
    // 如果修改数组中的 某一个索引 .添加的话
    switch (type) {
      case TriggerOrTypes.ADD: {
        // 数组改的是索引
        if (Array.isArray(target) && parseInt(key) + "" === key) {
          add(depsMap.get("length")); //手动触发length 。正常收集时，会收集length
        }
      }
    }
  }
  effects.forEach((effect: any) => effect());
  // 寻找key
  let dep = depsMap.get(key);
  if (!dep) {
    return;
  }
}
