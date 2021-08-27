import axios from "axios";

export const openFile = function (file, callback) {
  var reader = new FileReader();
  reader.onload = function () {
    callback(reader.result);
  };
  reader.readAsDataURL(file);
};

export const readJSON = (url) => {
  return axios.get(url).then((response) => response.data);
};

export const readImageFromUrl = (url) => {
  return axios.get(url, { responseType: "blob" }).then((res) => res.data).catch(err=> console.log('error loading image ',err));
};
export const readImage = (url, i) => {
  let imageUrl = url;
  if (url instanceof Blob) {
    imageUrl = URL.createObjectURL(url);
  }
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;
    image.onload = () => {
      if (i) resolve({ image, ...i });
      else resolve(image);
    };
    image.onerror = reject;
  });
};

function createName() {
  let res = "";
  Array.from(arguments).forEach((argument) => {
    if (argument) {
      res = `${res}${argument}.`;
    }
  });
  return res;
}
export function makeUrl() {
  let res = "";
  Array.from(arguments).forEach((argument, index) => {
    if (argument) {
      res = `${res}${index === 0 ? "" : "/"}${argument}`;
    }
  });
  return res;
};
export const preload = ({ baseUrl, config, files }) => {
  const x = { shot: config.shots[0], light: config.lights ? config.lights[0] : null };
  const bgUrl = `/${createName(x.shot, x.light)}bg.jpg`;
  const bgPatchUrl = `/${createName(x.shot, x.light)}pch.png`;
  const bgPatchShadowUrl = `/${createName(x.shot, x.light)}pch.sh.jpg`;
  const maskUrl = `/${createName(x.shot, x.light)}m.png`;
  const shadowUrl = `/${createName(x.shot, x.light)}sh.jpg`;
  const highlightUrl = `/${createName(x.shot, x.light)}hl.jpg`;
  const glowUrl = `/${createName(x.shot, x.light)}gl.jpg`;

  if (files.includes(bgUrl))
    readImage(makeUrl(baseUrl, bgUrl)).then((image) => {
      //setbgImg(image.src);
      
    });
  if (files.includes(bgPatchUrl)) readImage(makeUrl(baseUrl, bgPatchUrl)).then(() => {});
  if (files.includes(bgPatchShadowUrl)) readImage(makeUrl(baseUrl, bgPatchShadowUrl)).then(() => {});
  if (files.includes(maskUrl)) readImage(makeUrl(baseUrl, maskUrl)).then(() => {});
  if (files.includes(shadowUrl)) readImage(makeUrl(baseUrl, shadowUrl)).then(() => {});
  if (files.includes(highlightUrl)) readImage(makeUrl(baseUrl, highlightUrl)).then(() => {});
  if (files.includes(glowUrl)) readImage(makeUrl(baseUrl, glowUrl)).then(() => {});
};
