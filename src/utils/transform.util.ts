// src/utils/transform.util.ts
export function camelToSnakeCase(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
      return result;
    }, {});
  }
  
  export function snakeToCamelCase(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
      return result;
    }, {});
  }