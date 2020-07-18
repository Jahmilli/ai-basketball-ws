export const waitAsync = (timeout: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

export const getTestRequest = () => {
  // Figure out what request is...
  return {
    message: "hi"
  }
}
