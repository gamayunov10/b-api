export const waitForIt = (sec = 0) => {
  return new Promise((res): void => {
    setTimeout(() => res(true), sec * 1000);
  });
};
