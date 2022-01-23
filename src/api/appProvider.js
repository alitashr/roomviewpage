import { createCanvas } from "../utils/canvasUtils";
import { convertTilePointToName } from "../utils/converter";
import { getJsonFromUrl } from "../utils/domUtils";
import { readImageFromUrl } from "../utils/fileUtils";
import { MD5 } from "../utils/md5";
import { createUriSafe } from "../utils/stringUtils";
import HttpClient from "./httpClient";

export const build = "v3";

const LOCAL_SERVER = "http://localhost:61960";
const REMOTE_SERVER = `https://${build}.explorug.com`;
const isLocalEnv = process.env.REACT_APP_LOCAL_SERVER === "true";
export const domain = isLocalEnv ? LOCAL_SERVER : REMOTE_SERVER;
let provider = "appproviderv3.aspx";
const API_KEY = "apikey";

export const assetsDomain =
  build === "v3" && domain === REMOTE_SERVER
    ? "https://assets.explorug.com" //"https://d1tvaiszosdaib.cloudfront.net"
    : `${domain}/Assets`;
export const CDN_domain = process.env.PUBLIC_URL.trim() !== "" ? process.env.PUBLIC_URL + "/" : "./";

let apikey;
let cacheLocation = "";
const s3ServerRoomViewBucketUrl = "https://explorug.com/archanastools/awsupload/default.aspx";

const getCacheLocationFromUrl = (url) => url.split("/")[2];

export const getApiKey = () => {
  if (!apikey) apikey = sessionStorage.getItem(API_KEY);
  return apikey;
};
export const getPageName = () => {
  let page;
  let relogin = true;
  page = getJsonFromUrl().page;
  if (!page) {
    page = sessionStorage.getItem("page");
    relogin = sessionStorage.getItem("relogin");
  }
  return { page, relogin };
};

const postHttpClient = (data, config, sendErrorReport = true) => {
  return new Promise((resolve, reject) => {
    HttpClient.post(`${domain}/${provider}`, data, config)
      .then((response) => resolve(response.data))
      .catch((error) => {
        //if (sendErrorReport) postErrorReport(error, data);
        reject(error);
      });
  });
};
const postWithRetry = (data) => {
  return new Promise((resolve, reject) => {
    let numtries = 0;
    const fetchData = () => {
      postHttpClient(data, {}, false)
        .then(resolve)
        .catch((error) => {
          numtries++;
          if (numtries <= 5) fetchData();
          else {
            //postErrorReport(error, data);
            reject(error);
          }
        });
    };
    fetchData();
  });
};
const processPath = (path, thumbFromCDN = true) => {
  const s = path.split("/").map(encodeURIComponent);
  if (s[1] === "Assets" && thumbFromCDN) {
    const ss = s.slice(2);
    return `${assetsDomain}/${ss.join("/")}`;
  } else {
    return `${domain}${createUriSafe(path)}`;
  }
};
const fetchApiKey = ({ username, password, encrypted = false }) => {
  let data = new FormData();
  data.append("action", "login");
  data.append("username", username);
  data.append("password", password);
  if (encrypted) {
    data.append("encrypted", encrypted);
  }
  return new Promise((resolve, reject) => {
    postWithRetry(data)
      .then((res) => {
        const key = res.Key;
        if (!key) reject("INVALUD CREDENTIALS");
        else {
          sessionStorage.setItem("page", username);
          sessionStorage.setItem(API_KEY, key);
          sessionStorage.setItem("relogin", false);
          sessionStorage.setItem("multiplelogin", true);
          resolve(key);
        }
      })
      .catch(reject);
  });
};

export const autoLogin = (pageName) => {
  var { page, relogin } = getPageName();
 if(pageName)
  page = pageName;
  
  const username = sessionStorage.getItem("username") || "";
  const password = sessionStorage.getItem("password") || "";

  return new Promise((resolve, reject) => {
    if (page && page !== "undefined") {
      HttpClient.post(`${domain}/login/app${page}.aspx`)
        .then((response) => {
          if (!response.data) {
            reject("INVALID_CREDENTIALS");
            return;
          }
          sessionStorage.setItem("relogin", false);
          sessionStorage.setItem(API_KEY, response.data.Key);
          sessionStorage.setItem("multiplelogin", false);
          resolve(response.data);
          return;
        })
        .catch(reject);
    } else if (username && username !== "" && password && password !== "") {
      fetchApiKey(username, password, true)
        .then((key) => {
          return;
        })
        .catch(reject("NO_LOGIN_PAGE"));
    } else {
      const key = sessionStorage.getItem(API_KEY);
      if (key) resolve(key);
      else reject("NO_LOGIN_PAGE");
      return;
    }
  });
};

export const fetchDesignList = (params = {}) => {
  const { struct } = params;
  let data = new FormData();
  data.append("action", "designlist");
  data.append("key", getApiKey());
  if (struct) {
    data.append("mode", "struct");
  }
  return new Promise((resolve, reject) => {
    let numtries = 0;
    post();
    function post() {
      postHttpClient(data)
        .then(resolve)
        .catch((err) => {
          if (err.code === "ECONNABORTED" && numtries < 5) {
            numtries++;
            post();
          } else {
            reject(err);
          }
        });
    }
  });
};

export const fetchDesignThumbnails = ({
  designs,
  customThumbPath = false,
  thumbFromCDN = false,
  showThumbTexture = false,
}) => {
  //const { customThumbPath } = window.flags.designListTree;
  // const { thumbFromCDN = true, showThumbTexture = false } = window.flags;
  const fullpaths = designs.map((item) => item.fullPath);

  let data = new FormData();
  data.append("action", "designthumbs");
  data.append("key", getApiKey());
  data.append("files", JSON.stringify(fullpaths));
  if (showThumbTexture) data.append("texture", 1);
  return postWithRetry(data).then((thumbList) => {
    return designs.map((childFile) => {
      const item = thumbList.find((item) => item.Name === childFile.fullPath);
      let add = {};
      if (item) {
        const hash = MD5(JSON.stringify(item.Props));
        const path = processPath(item.Thumb, thumbFromCDN);
        let thumbUrl = `${path}?t=${hash}`;
        if (customThumbPath) {
          const spl = item.Name.split("/").slice(1);
          const p = spl.join("/");
          thumbUrl = `${customThumbPath}/${p}`;
        }
        add = { thumbUrl, designProps: item.Props };
        cacheLocation = getCacheLocationFromUrl(item.Thumb);
      }
      return { ...childFile, ...add };
    });
  });
};

export const fetchColorList = (params) => {
  let data = new FormData();
  data.append("action", "colorlist");
  data.append("key", getApiKey());
  return postHttpClient(data);
};
export const fetchVisualizationTiles = ({ file, zoom, tiles, props, felt = 0 }) => {
  felt = felt ? 1 : 0;
  let data = new FormData();
  data.append("action", "visualizationtiles");
  data.append("key", getApiKey());
  data.append("file", file);
  data.append("zoom", zoom);
  data.append("felt", felt);
  data.append("tiles", JSON.stringify(tiles));
  if (props) data.append("props", JSON.stringify(props));
  return postHttpClient(data).then(processPath);
};
export const fetchDesignTiles = ({ file, zoom = 2, tiles, props, hash, felt = 0 }) => {
  felt = felt ? 1 : 0;
  let data = new FormData();
  data.append("action", "designtiles");
  data.append("key", getApiKey());
  data.append("file", file);
  data.append("felt", felt);
  data.append("zoom", zoom);
  data.append("tiles", JSON.stringify(tiles));
  if (props) data.append("props", JSON.stringify(props));

  return postWithRetry(data).then(processPath);
};
export const fetchPileTiles = ({ file, zoom = 2, tiles, props, hash }) => {
  let data = new FormData();
  data.append("action", "piletiles");
  data.append("key", getApiKey());
  data.append("file", file);
  data.append("zoom", zoom);
  data.append("tiles", JSON.stringify(tiles));
  if (props) data.append("props", JSON.stringify(props));
  return postWithRetry(data).then(processPath);
};

export const getRenderedDesign = async ({
  designDetails,
  fullpath,
  hash,
  zoom = 1,
  felt = 0,
  watermarkOptions = {},
  applyKLRatio = true,
}) => {
  const tileSize = 256;
  return new Promise((resolve, reject) => {
    let { Width, Height, KLRatio } = designDetails;
    const canvasWidth = Width * zoom;
    const canvasHeight = Height * zoom;
    if (!applyKLRatio) KLRatio = 1;
    const canvas = createCanvas(canvasWidth, canvasHeight * KLRatio);

    let xTotal = Math.floor((canvasWidth - 1) / 256) + 1;
    let yTotal = Math.floor((canvasHeight - 1) / 256) + 1;
    let tilepoints = [];
    for (let x = 0; x < xTotal; x++) {
      for (let y = 0; y < yTotal; y++) {
        tilepoints.push({ x, y, z: zoom, name: convertTilePointToName(x, y) });
      }
    }
    console.log("returnnewPromise -> tilepoints", tilepoints);

    const context = canvas.getContext("2d");
    fetchVisualizationTiles({
      file: fullpath,
      zoom,
      felt,
      props: designDetails,
      tiles: tilepoints.map((item) => item.name),
    }).then((basePath) => {
      let tileImagesLoaded = 0;
      tilepoints.forEach((tilePoint, index) => {
        const img = document.createElement("img");
        img.setAttribute("crossOrigin", "Anonymous");
        const { name } = tilePoint;
        let filename = `${basePath}/${name}.rendered.jpg`;
        if (hash && hash !== "") {
          filename = `${filename}?t=${hash}`;
        }
        img.src = filename;
        tilePoint.image = img;
        img.onload = () => {
          drawSingleTileInDesignCanvas(index);
          if (tileImagesLoaded + 1 === tilepoints.length) {
            drawWaterMarkIfNeeded();
          }
          tileImagesLoaded++;
        };
      });
      const drawSingleTileInDesignCanvas = (index) => {
        const tilepoint = tilepoints[index];
        const startX = tilepoint.x * tileSize;
        const startY = tilepoint.y * tileSize * KLRatio;
        context.drawImage(tilepoint.image, startX, startY, tilepoint.image.width, tilepoint.image.height * KLRatio);
      };
    });

    function drawWaterMarkIfNeeded() {
      const { hasWatermark = false, logoUrl, width: watWid, opacity, position } = watermarkOptions;
      if (!hasWatermark || !logoUrl) {
        resolve(canvas);
        return;
      }
      readImageFromUrl(logoUrl).then((logoImage) => {
        const width = watWid * 3 * zoom;
        const height = (logoImage.height * width) / logoImage.width;

        let padding = 15;
        const padx = position[1] === 0.0 ? -padding : position[1] === 1.0 ? padding : 0;
        const pady = position[0] === 0.0 ? -padding : position[0] === 1.0 ? padding : 0;
        const startx = position[1] * (canvasWidth - width) - padx;
        const starty = position[0] * (canvasHeight - height) - pady;

        context.globalAlpha = opacity;
        context.drawImage(logoImage, startx, starty, width, height);
        resolve(canvas);
      });
    }
  });
};

export const getRenderedBorderRug = async ({
  borderImgUrl,
  borderWidth,
  centerPatternImgUrl,
  designDetails,
  fullpath,
  hash,
  zoom = 1,
  felt = 0,
  watermarkOptions = {},
  applyKLRatio = true,
}) => {
  const tileSize = 256;
  return new Promise((resolve, reject) => {
    let { Width, Height, KLRatio, PhysicalWidth, PhysicalHeight } = designDetails;
    console.log("returnnewPromise -> Width, Height", Width, Height);
    const canvasWidth = Width * zoom;
    const canvasHeight = Height * zoom;
    if (!applyKLRatio) KLRatio = 1;
    let BorderCanvas = createCanvas(canvasWidth, canvasHeight * KLRatio);
    const borderCanvasContext = BorderCanvas.getContext("2d");

    const drawRepeatImgInCanvas = async ({ canvas, context, zoom, imgUrltoRepeat, isCenterCanvas = false }) => {
      return new Promise((resolve, reject) => {
        let xTotal = Math.floor((canvasWidth - 1) / 256) + 1;
        let yTotal = Math.floor((canvasHeight - 1) / 256) + 1;
        let tilepoints = [];
        for (let x = 0; x < xTotal; x++) {
          for (let y = 0; y < yTotal; y++) {
            tilepoints.push({ x, y, z: zoom, name: convertTilePointToName(x, y) });
          }
        }
        console.log("returnnewPromise -> tilepoints", tilepoints);

        //const context = canvas.getContext("2d");

        let tileImagesLoaded = 0;
        tilepoints.forEach((tilePoint, index) => {
          const img = document.createElement("img");
          img.setAttribute("crossOrigin", "Anonymous");
          const { name } = tilePoint;
          let filename = imgUrltoRepeat; //`${basePath}/${name}.rendered.jpg`;
          if (hash && hash !== "") {
            filename = `${filename}?t=${hash}`;
          }
          img.src = filename;
          tilePoint.image = img;
          img.onload = () => {
            drawSingleTileInDesignCanvas(index, tilepoints, context);
            if (tileImagesLoaded + 1 === tilepoints.length) {
              if (!isCenterCanvas)
                drawWaterMarkIfNeeded(canvas, canvasWidth, canvasHeight, context).then((res) => {
                  resolve(canvas);
                });
            }
            tileImagesLoaded++;
          };
        });
      });
    };

    drawRepeatImgInCanvas({
      canvas: BorderCanvas,
      context: borderCanvasContext,
      zoom,
      imgUrltoRepeat: borderImgUrl,
    }).then((resCanvas) => {
      if (centerPatternImgUrl && centerPatternImgUrl !== "") {
        let centerCanvasPhyWidth = PhysicalWidth - borderWidth * 2;
        let centerCanvasPhyHeight = PhysicalHeight - borderWidth * 2;
        let centerCanvasWid = (centerCanvasPhyWidth * Width) / PhysicalWidth;
        let centerCanvasHgt = (centerCanvasPhyHeight * Height) / PhysicalHeight;

        centerCanvasWid = centerCanvasWid * zoom;
        centerCanvasHgt = centerCanvasHgt * zoom;
        if (!applyKLRatio) KLRatio = 1;
        let centerCanvas = createCanvas(centerCanvasWid, centerCanvasHgt * KLRatio);
        const centerCanvascontext = centerCanvas.getContext("2d");
        centerCanvas = drawRepeatImgInCanvas({
          canvas: centerCanvas,
          context: centerCanvascontext,
          zoom,
          imgUrltoRepeat: centerPatternImgUrl,
        }).then((resCenterCanvas) => {
          const startx = (canvasWidth - centerCanvasWid) / 2;
          const starty = (canvasHeight - centerCanvasHgt) / 2;
          const finalCanvasContext = resCanvas.getContext("2d");
          finalCanvasContext.drawImage(resCenterCanvas, startx, starty, centerCanvasWid, centerCanvasHgt);
          resolve(resCanvas);
        });
      } else {
        resolve(resCanvas);
      }
    });

    //   let centerCanvasPhyWidth = PhysicalWidth - borderWidth *2;
    //   let centerCanvasPhyHeight = PhysicalHeight - borderWidth *2;
    //   let centerCanvasWid = centerCanvasPhyWidth * Width/PhysicalWidth;
    //   let centerCanvasHgt = centerCanvasPhyHeight * Height/PhysicalHeight;

    //   centerCanvasWid = centerCanvasWid * zoom;
    //   centerCanvasHgt = centerCanvasHgt * zoom;
    //   if (!applyKLRatio) KLRatio = 1;
    //   let centerCanvas = createCanvas(centerCanvasWid, centerCanvasHgt * KLRatio);
    //   const centerCanvascontext = centerCanvas.getContext("2d");
    // centerCanvas = drawRepeatImgInCanvas({canvas:centerCanvas, context: centerCanvascontext,zoom, imgUrltoRepeat: centerPatternImgUrl});

    //   const startx = (canvasWidth-centerCanvasWid)/2;
    //   const starty = (canvasHeight-centerCanvasHgt)/2;
    //   const finalCanvasContext = canvas.getContext("2d");
    // finalCanvasContext.drawImage(centerCanvascontext, startx, starty, centerCanvasWid, centerCanvasHgt);

    // resolve(canvas);

    const drawSingleTileInDesignCanvas = (index, tilepoints, context) => {
      const tilepoint = tilepoints[index];
      const startX = tilepoint.x * tileSize;
      const startY = tilepoint.y * tileSize * KLRatio;
      context.drawImage(tilepoint.image, startX, startY, tilepoint.image.width, tilepoint.image.height * KLRatio);
    };
    //});

    const drawWaterMarkIfNeeded = async (canvas, canvasWidth, canvasHeight, context) => {
      return new Promise((resolve, reject) => {
        const { hasWatermark = false, logoUrl, width: watWid, opacity, position } = watermarkOptions;
        if (!hasWatermark || !logoUrl) {
          resolve(canvas);
          return;
        }
        readImageFromUrl(logoUrl).then((logoImage) => {
          const width = watWid * 3 * zoom;
          const height = (logoImage.height * width) / logoImage.width;

          let padding = 15;
          const padx = position[1] === 0.0 ? -padding : position[1] === 1.0 ? padding : 0;
          const pady = position[0] === 0.0 ? -padding : position[0] === 1.0 ? padding : 0;
          const startx = position[1] * (canvasWidth - width) - padx;
          const starty = position[0] * (canvasHeight - height) - pady;

          context.globalAlpha = opacity;
          context.drawImage(logoImage, startx, starty, width, height);
          //return canvas
          resolve(canvas);
        });
      });
    };
  });
};

let floorsFromServer = null;

export const getFloor = () => {
  const floorDomain = "https://v3.explorug.com/modules/vpsassets/apps/getjpeglist/default.aspx?folder=onlinevps/floors";
  const floorAssetsDomain = "https://cdn.virtualrugstudio.com/";
  const floorRelPath = "OnlineVPS/Floors/";
  return new Promise((resolve, reject) => {
    if (!floorsFromServer) {
      HttpClient.post(floorDomain).then((response) => {
        let floorArr = [];
        floorArr = response.data.map((eachFloor, index) => {
          let config = JSON.parse(eachFloor.config);
          let obj = {
            ...config,
            path: `${floorAssetsDomain}${floorRelPath}${eachFloor.diffuse}`,
            thumb: `${floorAssetsDomain}${floorRelPath}${eachFloor.diffuse.replace(".jpg", ".thumb.jpg")}`,
          };
          return obj;
        });
        const returnObj = {
          show: false,
          floors: floorArr,
          activeFloor: floorArr[0],
        };
        floorsFromServer = returnObj;
        resolve(returnObj);
      });
    } else {
      resolve(floorsFromServer);
    }
  });
};

export const uploadRoomviewBlob = ({ blob, filename }) => {
  const data = new FormData();
  data.append("file", blob);
  data.append("filename", filename);
  
  return new Promise((resolve, reject) => {

    let numtries = 0;
    function post() {
      return HttpClient.post(s3ServerRoomViewBucketUrl, data)
        .then((response) => {
          if (response.status === 200) resolve(response.data);
          else {
            console.log("post -> err", response)
            if (numtries < 5) {
              numtries++;
              post();
            } else {
              reject(response.data);
            }
          }
        })
        .catch((err) => {

            reject(err);if (numtries < 5) {
              numtries++;
              post();
            } else {
              reject(err);
            }
        });
    }
    return post();
    

    // return HttpClient.post(s3ServerRoomViewBucketUrl, data)
    //   .then((response) => {
    //     if (response.status === 200) resolve(response.data);
    //     else {
    //       reject(response.data);
    //     }
    //   })
    //   .catch((error) => {
    //     //postErrorReport(error, data, true);
    //     reject(error);
    //   });
  });
};
