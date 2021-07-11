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



export function trigger (target,type,key,newVal){

}