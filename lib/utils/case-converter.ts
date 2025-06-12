import { camelCase, snakeCase } from "change-case";

/**
 * 检查一个值是否为可以遍历的对象（非数组、非null的普通对象）。
 * @param value - 要检查的值。
 * @returns 如果是可遍历的对象，则返回true。
 */
function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * 递归地转换对象或对象数组的键。
 * @param obj - 要转换的对象或数组。
 * @param converter - 用于转换每个键的函数 (e.g., camelCase, snakeCase)。
 * @returns 一个新的、所有键都被转换过的对象或数组。
 */
function deepConvertKeys(obj: any, converter: (key: string) => string): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepConvertKeys(item, converter));
  }

  if (isObject(obj)) {
    const newObj: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = converter(key);
        newObj[newKey] = deepConvertKeys(obj[key], converter);
      }
    }
    return newObj;
  }

  return obj;
}

/**
 * 深度将对象的键转换为 camelCase。
 * @param obj - 要转换的对象或数组。
 */
export const deepConvertToCamelCase = (obj: any) =>
  deepConvertKeys(obj, camelCase);

/**
 * 深度将对象的键转换为 snake_case。
 * @param obj - 要转换的对象或数组。
 */
export const deepConvertToSnakeCase = (obj: any) =>
  deepConvertKeys(obj, snakeCase);
