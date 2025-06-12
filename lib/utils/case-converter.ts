import { camelCase, snakeCase } from "change-case";

type CaseConverter = (input: string) => string;

/**
 * 深度转换对象的键名。
 * @param obj - 要转换的对象。
 * @param converter - 用于转换键名的函数 (e.g., camelCase, snakeCase)。
 * @returns 转换后的新对象。
 */
function deepConvertKeys(obj: any, converter: CaseConverter): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => deepConvertKeys(v, converter));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = converter(key);
      acc[newKey] = deepConvertKeys(obj[key], converter);
      return acc;
    }, {} as { [key: string]: any });
  }
  return obj;
}

/**
 * 将对象的键名深度转换为 camelCase。
 * @param obj - 要转换的对象。
 * @returns 键名转换为 camelCase 的新对象。
 */
export function deepConvertToCamelCase(obj: any) {
  return deepConvertKeys(obj, camelCase);
}

/**
 * 将对象的键名深度转换为 snake_case。
 * @param obj - 要转换的对象。
 * @returns 键名转换为 snake_case 的新对象。
 */
export function deepConvertToSnakeCase(obj: any) {
  return deepConvertKeys(obj, snakeCase);
}
