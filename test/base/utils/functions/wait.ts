export const waitForIt = (sec: number) => {
  return new Promise((res): void => {
    setTimeout(() => res(true), sec * 1000);
  });
};
