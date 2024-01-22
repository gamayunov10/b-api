type obj = {
  [key: string]: any;
};

export function transformKeys(input: obj[]): obj[] {
  return input.map((obj) => {
    const transformedObj: obj = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const transformedKey = key.slice(2);
        transformedObj[transformedKey] = obj[key];
      }
    }

    return transformedObj;
  });
}
