import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";
export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers);
}

export function shallowReactive(target) {}

export function shallowReadonly(target) {}

export function readonly(target) {}

// 代理映射表
const reactiveMap = new WeakMap(); //会自动垃圾回收，不会造成内存泄漏。存储的key只能是对象
const readonlyMap = new WeakMap();
// 是不是仅读，是不是深度， 柯里化。 new Proxy()
export function createReactiveObject(target, isReadonly, baseHandlers) {
  if (!isObject(target)) {
    return target;
  }

  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  const existProxy = proxyMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  // 如果某个对象已经被代理过了，就不要再次代理了，  可能一个对象被代理是深度 又被仅读代理了
  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
