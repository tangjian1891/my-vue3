import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOrTypes } from "./operators";
import { reactive } from "./reactive";

// 实现new Proxy(target,handler)
let readonlyObj = {
  set(target, key) {
    console.warn(`set on key ${key} failed`);
  },
};

export const mutableHandlers = {
  get(target, key, receiver) {
    // proxy+reflect 联合使用
    const res = Reflect.get(target, key, receiver); //==target[key]  receiver就是proxy
    console.log("收集数据啊啊");
    track(target, TrackOpTypes.GET, key); //收集依赖
    // 收集依赖，等会数据变化后更新对应的视图
    if (isObject(res)) {
      return reactive(res); //vue2 是一上来就递归，vue3是取值的时候会进行代理,vue3的代理模式是懒代理
    }

    return res;
  },
  set(target, key, value, receiver) {
    console.log("有获取值的啊", target, key, value);
    const oldVale = target[key]; //老值
   
    // 1.新增 2.修改 3.老值新值一样
    const hasOwnProperty = Object.prototype.hasOwnProperty;

    // 是新增还是修改  需要判断是数组还是对象
    // 既要是数组，也要key也要是数字类型的字符串擦性
    let hadKey = false;
    if (Array.isArray(target) && parseInt(key) + "" === key) {
      hadKey = Number(key) < target.length;
    } else {
      hadKey = hasOwnProperty.call(target, key);
    }

    let result = Reflect.set(target, key, value, receiver);
    // 是否有值
    if (!hadKey) {
      // 新增
      trigger(target, TriggerOrTypes.ADD, key, value);
    } else if (oldVale !== value) {
      // 修改
      console.log("修改后触发了 ");
      trigger(target, TriggerOrTypes.SET, key, value, oldVale);
    }

    return result;
  },
};
export const shallowReactiveHandlers = {};

export const readonlyHandlers = {
  set() {},
  ...readonlyObj,
};

export const shallowReadonlyHandlers = {
  set() {},
  ...readonlyObj,
};
