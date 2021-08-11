export const getPathOffile = fileFullPath => {
  const sp = fileFullPath.split("/");
  sp.pop();
  return sp.join("/");
};

export const createUriSafe = uriString => {
  const enc = uriString.split("/").map(encodeURIComponent);
  return enc.join("/");
};
