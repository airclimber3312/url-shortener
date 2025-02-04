export const isValidUrl = (url: string) => {
  const pattern = /^(https?:\/\/)[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
  return pattern.test(url);
};