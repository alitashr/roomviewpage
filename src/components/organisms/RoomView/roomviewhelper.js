
import { clearCanvas, createCanvas, cropStitchCanvas, downloadImageData } from "../../../utils/canvasUtils";
import { convertArrintoDeg, convertUnit } from "../../../utils/converter";
import { makeUrl, readImage } from "../../../utils/fileUtils";
import { resizeKeepingAspect } from "../../../utils/utils";
import ThreeViewHelper from "./threeviewhelper";

function createName() {
  let res = "";
  Array.from(arguments).forEach(argument => {
    if (argument) {
      res = `${res}${argument}.`;
    }
  });
  return res;
}

const rgbFromHex = hex => {
  let rgb = new Array(3);
  rgb[0] = parseInt(hex.substring(1, 3), 16);
  rgb[1] = parseInt(hex.substring(3, 5), 16);
  rgb[2] = parseInt(hex.substring(5, 7), 16);
  return rgb;
};

const patchRgb = [45, 24, 18];
export default class RoomViewHelper {
  constructor () {
    this.config = {};
    this.baseUrl = null;
    this.dimension = { width: null, height: null };
    this.dimensionPixels = { width: null, height: null };
    this.bgImage = null;
    this.maskImage = null;
    this.bgPatchImage = null;
    this.bgPatchShadowImage = null;
    this.shadowImage = null;
    this.highlightImage = null;
    this.canvasArray = Array(4);

    this.carpetURL = "";
    this.fbxLoaded = false;
    this.threeView = new ThreeViewHelper();

    this.zoom = 2;
    this.currentActiveColors = [];
  }

  initCanvas(options) {
    this.bgCanvas = options.bgCanvas;
    this.threeCanvas = options.threeCanvas;
    this.maskCanvas = options.maskCanvas;
    this.shadowCanvas = options.shadowCanvas;
    this.container = options.container;
    this.inputCanvas = options.inputCanvas;
    this.transitionCanvas = options.transitionCanvas;
    this.floatingOptionsContainer = options.floatingOptionsContainer;
  }
  clearAllCanvases() {
    const { width, height } = this.dimension;
    clearCanvas(this.bgCanvas, width, height);
    clearCanvas(this.maskCanvas, width, height);
    clearCanvas(this.shadowCanvas, width, height);
    clearCanvas(this.inputCanvas, width, height);
    clearCanvas(this.transitionCanvas, width, height);
  }
  initConfig({ baseUrl, config, files, sizeFromConfig = false }) {
    this.baseUrl = baseUrl;
    this.config = config;
    this.files = normalizeDirNames(files);
    const illustrationDims = this.config.dims;
    const containerDims = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.currentActiveColors = [];
    this.selectedColorCode = null;
    this.resolution = window.devicePixelRatio;
    this.dimensionPixels = resizeKeepingAspect(illustrationDims, containerDims, "fit_inside");

    this.dimension = {
      width: sizeFromConfig && illustrationDims.width ? illustrationDims.width: window.screen.width * this.resolution,
      height:sizeFromConfig && illustrationDims.height ? illustrationDims.height: window.screen.height * this.resolution
    };
    this.resolution = this.dimension.width / this.dimensionPixels.width;
    this.inputCanvas.width = this.dimensionPixels.width;
    this.inputCanvas.height = this.dimensionPixels.height;
    if (this.floatingOptionsContainer) {
      this.floatingOptionsContainer.style.width = `${this.dimensionPixels.width}px`;
      this.floatingOptionsContainer.style.height = `${this.dimensionPixels.height}px`;
    }
    // setCanvasDimensions(this.inputCanvas, this.dimension, this.dimensionPixels)
    clearCanvas(this.bgCanvas, this.dimension.width, this.dimension.height);

    const x = {
      shot: this.config.shots[0],
      light: this.config.lights ? this.config.lights[0] : null
    };
    const bgUrl = `${createName(x.shot, x.light)}bg.jpg`;
    const bgPatchUrl = `${createName(x.shot, x.light)}pch.png`;
    const bgPatchShadowUrl = `${createName(x.shot, x.light)}pch.sh.jpg`;
    const bgPatchGreyUrl = `${createName(x.shot, x.light)}pch.grey.jpg`;
    const maskUrl = `${createName(x.shot, x.light)}m.png`;
    const shadowUrl = `${createName(x.shot, x.light)}sh.jpg`;
    const highlightUrl = `${createName(x.shot, x.light)}hl.jpg`;
    const glowUrl = `${createName(x.shot, x.light)}gl.jpg`;
    const promises = [];
    this.bgImage = null;
    this.maskImage = null;
    this.patchImage = null;
    this.patchShadow = null;
    this.shadowImage = null;
    this.highlightImage = null;
    this.glowImage = null;
    if (!this.files.includes(bgUrl)) promises.push(Promise.reject("no background image"));
    else {
      promises.push(readImage(makeUrl(baseUrl, bgUrl)).then(img => (this.bgImage = img)));
      if (this.files.includes(bgPatchUrl))
        promises.push(readImage(makeUrl(baseUrl, bgPatchUrl)).then(img => (this.patchImage = img)));
      if (this.files.includes(bgPatchShadowUrl))
        promises.push(
          readImage(makeUrl(baseUrl, bgPatchShadowUrl)).then(img => (this.patchShadow = img))
        );
      if (this.files.includes(bgPatchGreyUrl))
        promises.push(
          readImage(makeUrl(baseUrl, bgPatchGreyUrl)).then(img => (this.patchGreyImage = img))
        );
      if (this.files.includes(maskUrl))
        promises.push(readImage(makeUrl(baseUrl, maskUrl)).then(img => (this.maskImage = img)));
      if (this.files.includes(shadowUrl))
        promises.push(readImage(makeUrl(baseUrl, shadowUrl)).then(img => (this.shadowImage = img)));
      if (this.files.includes(highlightUrl))
        promises.push(
          readImage(makeUrl(baseUrl, highlightUrl)).then(img => (this.highlightImage = img))
        );
      if (this.files.includes(glowUrl))
        promises.push(readImage(makeUrl(baseUrl, glowUrl)).then(img => (this.glowImage = img)));
    }
    return promises;
  }
  updateBackground(options = {}) {
    const { clear = false, dominantColorHex, canvas = this.bgCanvas } = options;
    const { width, height } = this.dimension;

    const bgCtx = canvas.getContext("2d");

    const tempBgCanvas = createCanvas(width, height);
    tempBgCanvas.getContext("2d").drawImage(this.bgCanvas, 0, 0, width, height);

    clearCanvas(canvas, width, height);
    setCanvasDimensions(canvas, this.dimension, this.dimensionPixels);
    if (clear) {
      return "clear";
    }
    bgCtx.drawImage(this.bgImage, 0, 0, width, height);
    bgCtx.drawImage(tempBgCanvas, 0, 0, width, height);
    if (this.patchImage) {
      this.annotationCanvas = createCanvas(this.dimensionPixels.width, this.dimensionPixels.height);
      this.annotationCanvas
        .getContext("2d")
        .drawImage(this.patchImage, 0, 0, this.dimensionPixels.width, this.dimensionPixels.height);
    } else {
      this.annotationCanvas = null;
    }

    if (this.patchImage && dominantColorHex) {
      const activeColor = rgbFromHex(dominantColorHex);
      const patchCanvas = createCanvas(width, height);
      const patchCtx = patchCanvas.getContext("2d");
      patchCtx.drawImage(this.patchImage, 0, 0, width, height);
      let patchData = patchCtx.getImageData(0, 0, width, height);

      if (!this.selectedColorCode) this.selectedColorCode = patchRgb;
      //console.log(patchData.data)
      let counter = 0, ifcounter = 0;
      let t1 = performance.now();
      for (let i = 0; i < patchData.data.length; i += 4) {
        counter++;
        if (
          patchData.data[i] === this.selectedColorCode[0] &&
          patchData.data[i + 1] === this.selectedColorCode[1] &&
          patchData.data[i + 2] === this.selectedColorCode[2]
        ) {
          ifcounter++;
          patchData.data[i] = activeColor[0];
          patchData.data[i + 1] = activeColor[1];
          patchData.data[i + 2] = activeColor[2];
        } else {
          patchData.data[i] = 128;
          patchData.data[i + 1] = 128;
          patchData.data[i + 2] = 128;
          patchData.data[i + 3] = 0;
        }
      }
      let t2 = performance.now();
      //console.log(t2 - t1, " ms ", counter, " counter ", ifcounter);
      const sel = this.currentActiveColors.findIndex(
        item => item.annotationColor === this.selectedColorCode
      );
      if (!sel || sel === -1) {
        this.currentActiveColors.push({
          annotationColor: this.selectedColorCode,
          dominantColorHex
        });
      } else
        this.currentActiveColors[sel] = {
          annotationColor: this.selectedColorCode,
          dominantColorHex
        };

      patchCtx.putImageData(patchData, 0, 0);
      const patchGreyCanvas = createCanvas(width, height);
      const patchGreyCtx = patchGreyCanvas.getContext("2d");
      if (this.patchGreyImage) {
        patchGreyCtx.drawImage(this.patchGreyImage, 0, 0, width, height);
      }

      patchGreyCtx.globalCompositeOperation = "overlay";
      patchGreyCtx.drawImage(patchCanvas, 0, 0, width, height);

      if (this.patchShadow) {
        patchGreyCtx.globalCompositeOperation = "multiply";
        patchGreyCtx.drawImage(this.patchShadow, 0, 0, width, height);
      }

      patchGreyCtx.globalCompositeOperation = "destination-in";
      patchGreyCtx.drawImage(patchCanvas, 0, 0, width, height);
      // document.body.appendChild(patchCanvas)
      bgCtx.drawImage(patchGreyCanvas, 0, 0, width, height);
    }
    return "successfully updated bg";
  }
  updatethreeCanvas(options = {}) {
    const { carpetRotation } = options;
    if (!this.config.scenes) return;
    const scene = this.config.scenes[0];
    const { roomType, shots } = this.config;
    const sceneConfig = this.config[scene];
    this.threeView.init({
      canvas: this.threeCanvas,
      config: sceneConfig,
      shots,
      dims: this.dimensionPixels,
      resolution: this.resolution,
      baseUrl: this.baseUrl,
      roomType
    });
   // return this.threeView.setupSceneObjects({ fbxUrl: "https://v3.explorug.com/rug.fbx" });
   switch (roomType) {
    case "illustration":
      return this.threeView.setup3dObject({ fbxUrl: makeUrl(this.baseUrl, sceneConfig.modelUrl) });
    default:
      return this.threeView.setupCarpet({ fbxUrl: "https://v3.explorug.com/rug.fbx" });

  }
  }
  renderImage({image, physicalWidth, physicalHeight}){
    const { width, height } = image;
    const designCanvas = createCanvas(width, height);
    const ctx = designCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    const normapCanvas = createCanvas(width, height);
    const ctxNorm = normapCanvas.getContext("2d");
    ctxNorm.fillStyle = "rgb(127,127,255)";
    ctxNorm.fillRect(0, 0, width, height);
    let PhysicalWidth, PhysicalHeight;
    if (!physicalWidth || !physicalHeight) {
      const maxDims = { width: 1200, height: 1500 };
      const { width: newWidth, height: newHeight } = resizeKeepingAspect(
        { width, height },
        maxDims,
        "fit_inside"
      );
      PhysicalWidth = convertUnit("in", "ft", newWidth / 10);
      PhysicalHeight = convertUnit("in", "ft", newHeight / 10);
    } else {
      PhysicalWidth = convertUnit("cm", "ft", physicalWidth);
      PhysicalHeight = convertUnit("cm", "ft", physicalHeight);
    }
    const designDetails = {
      Width: width,
      Height: height,
      PhysicalWidth,
      PhysicalHeight,
      Unit: "ft"
    };

    this.threeView.setCarpetTexture({ designDetails, designCanvas, normapCanvas });
    this.updateGizmo();
  }

  renderDesignFromCustomUrl({ customUrl, physicalWidth, physicalHeight }) {
    return new Promise((resolve, reject) => {
      readImage(customUrl)
        .then(image => {
          this.renderImage ({image, physicalWidth, physicalHeight})
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  renderFloor({ path }) {
    console.log("renderFloor -> renderFloor")
    return new Promise((resolve, reject) => {
      if (!this.threeView) {
        resolve();
        return;
      }
      if (!path) {
        this.threeView.changeFloorVisibility(false);
        resolve();
        return;
      }
      readImage(path).then(floorImage => {
        if (!this.floorCanvas) this.floorCanvas = createCanvas(floorImage.width, floorImage.height);
        else {
          this.floorCanvas.width = floorImage.width;
          this.floorCanvas.height = floorImage.height;
        }
        this.floorCanvas.getContext("2d").drawImage(floorImage, 0, 0);
        this.threeView.setFloorTexture({ floorCanvas: this.floorCanvas });
        console.log('floorImage.width, floorImage.height', floorImage.width, floorImage.height)
        resolve();
      });
    });
  }
  renderWallpaper({ path, dims }) {
    return new Promise((resolve, reject) => {
      if (!this.threeView) {
        resolve();
        return;
      }
      if (!path) {
        this.threeView.changeWallpaperVisibility(false);
        resolve();
        return;
      }
      readImage(path).then((wallpaperImage) => {
        if (!this.wallpaperCanvas) this.wallpaperCanvas = createCanvas(wallpaperImage.width, wallpaperImage.height);
        else {
          this.wallpaperCanvas.width = wallpaperImage.width;
          this.wallpaperCanvas.height = wallpaperImage.height;
        }
        this.wallpaperCanvas.getContext("2d").drawImage(wallpaperImage, 0, 0);
        this.threeView.setWallpaperTexture({ wallpaperCanvas: this.wallpaperCanvas, dims });
        resolve();
      });
    });
  }
  setWallpaperSurfaceSize({ surfaceSize }) {
    return new Promise((resolve, reject) => {
      if (!surfaceSize) {
        resolve();
        return;
      }
      this.threeView.setWallpaperSurfaceSize({ surfaceSize });
    });
  }
  updateCarpetPosition(position) {
    this.threeView.setCarpetPositon(position);
    this.updateGizmo();
  }
  updateCarpetRotation(rotation) {
    this.threeView.setCarpetRotation(rotation);
  }
  setTileDetails(tileDetails) {
    this.tileDetails = tileDetails;
  }
 
  updateMask(options = {}) {
    const { clear = false } = options;
    const { width, height } = this.dimension;
    setCanvasDimensions(this.maskCanvas, this.dimension, this.dimensionPixels);
    clearCanvas(this.maskCanvas, width, height);
    if (clear) return "clear";
    if (!this.maskImage) return;

    const tmpCanvas = createCanvas(width, height);
    tmpCanvas.getContext("2d").drawImage(this.bgCanvas, 0, 0, width, height);
    if (!this.config.hasTransparencyMask) makeMask(tmpCanvas, width, height, this.maskImage, true);
    else {
      tmpCanvas.getContext("2d").globalCompositeOperation = "destination-in";
      tmpCanvas.getContext("2d").drawImage(this.maskImage, 0, 0, width, height);
    }
    this.maskCanvas.getContext("2d").drawImage(tmpCanvas, 0, 0, width, height);
  }
  async updateShadow(options = {}) {
    const { clear = false } = options;
    clearCanvas(this.shadowCanvas, this.shadowCanvas.width, this.shadowCanvas.height);
    if (clear) return "clear";
    const { width, height } = this.dimension;
    const tempCanvas = createCanvas(width, height);
    const tCtx = tempCanvas.getContext("2d");
    setCanvasDimensions(this.shadowCanvas, this.dimension, this.dimensionPixels);
    let threeLayer = this.threeCanvas;
    if (!this.threeView.renderer) return;
    this.threeView.render();
    tCtx.drawImage(threeLayer, 0, 0, width, height);
    tCtx.drawImage(this.maskCanvas, 0, 0, width, height);

    if (this.shadowImage) {
      tCtx.globalCompositeOperation = "multiply";
      tCtx.drawImage(this.shadowImage, 0, 0, width, height);
    }
    if (this.highlightImage) {
      tCtx.globalCompositeOperation = "screen";
      tCtx.drawImage(this.highlightImage, 0, 0, width, height);
    }
    if (this.glowImage) {
      tCtx.globalCompositeOperation = "overlay";
      tCtx.drawImage(this.glowImage, 0, 0, width, height);
    }
    tCtx.globalCompositeOperation = "destination-in";
    tCtx.drawImage(threeLayer, 0, 0, width, height);
    this.shadowCanvas.getContext("2d").drawImage(tempCanvas, 0, 0, width, height);
 
  }
  makeTransitionCanvas(options = {}) {
    // return
    const { clear = false } = options;
    if(this.transitionCanvas)
      clearCanvas(this.transitionCanvas, this.transitionCanvas.width, this.transitionCanvas.height);
    if (clear) return "clear";
    setCanvasDimensions(this.transitionCanvas, this.dimension, this.dimensionPixels);
    const transitionctx = this.transitionCanvas.getContext("2d");

    transitionctx.drawImage(this.bgCanvas, 0, 0, this.dimension.width, this.dimension.height);
    transitionctx.drawImage(this.threeCanvas, 0, 0, this.dimension.width, this.dimension.height);
    transitionctx.drawImage(this.maskCanvas, 0, 0, this.dimension.width, this.dimension.height);
    transitionctx.drawImage(this.shadowCanvas, 0, 0, this.dimension.width, this.dimension.height);
    return "done";
  }
  handleCanvasClick(e) {
    return;
    // if (!this.annotationCanvas) return
    // const imgData = this.annotationCanvas.getContext("2d").getImageData(e.x, e.y, 1, 1)
    // if (imgData.data.every(data => data === 255)) return;
    // this.selectedColorCode = imgData.data.slice(0, 3)
    // return this.selectedColorCode
  }
  mouseDownTouchStart(e) {
    this.updateGizmo();
    this.intersectsGizmo = this.findGizmoIntersection(e);
    this.moved = false;
    this.prev = { ...e };
    if (!this.intersectsGizmo) {
      const intersectsCarpet = this.threeView.mouseDownTouchStart(e);
      this.shadowCleared = false;
      if (intersectsCarpet) {
        this.updateShadow({ clear: true });
        this.shadowCleared = true;
      }
    } else {
      this.prev = { ...e };
      this.updateShadow({ clear: true });
      this.shadowCleared = true;
    }
  }
  mouseDownTouchMove(e) {
    const difference = e.x - this.prev.x;
    this.moved = difference > 10;
    if (!this.intersectsGizmo) {
      this.threeView.mouseTouchMove(e);
      this.updateGizmo();
    } else {
      this.threeView.rotateCarpet(difference, "z");
      this.prev = { ...e };
    }
  }
  mouseDownTouchEnd(e) {
    if (this.shadowCleared) this.updateShadow();
    let showColorSelectionBox = null;
    if (!this.moved && this.annotationCanvas) {
      const imgData = this.annotationCanvas.getContext("2d").getImageData(e.x, e.y, 1, 1);
      if (!imgData.data.every(data => data === 255 || data === 0))
        showColorSelectionBox = this.selectedColorCode = imgData.data.slice(0, 3);
    }
    let rotation = null;
    let position = null;
    const object = this.threeView.getObjectConfig();
    let texCoordinates;
    const intersect = this.threeView.raycastMouseOnSurface(e) ;
    if (intersect && this.designDetails) {
      const x = this.designDetails.Width * intersect.uv.x;
      const y = this.designDetails.Height * (1 - intersect.uv.y);
      texCoordinates = { x, y };
    }
    if (object) {
      if (this.intersectsGizmo) {
        rotation = convertArrintoDeg(object.rotation.toArray().slice(0, 3));
      } else {
        position = object.position;
      }
    }

    return { showColorSelectionBox, rotation, position, texCoordinates };
  }
  findGizmoIntersection(e) {
    const { x, y } = e;
    if (!this.inputCanvas) return;
    var imgData = this.inputCanvas.getContext("2d").getImageData(x - 10, y - 10, 20, 20);
    var ingizmo = false;
    for (var i = 0; i < imgData.data.length; i += 4) {
      if (imgData.data[i + 3] !== 0) {
        ingizmo = true;
        break;
      }
    }
    return ingizmo;
  }
  clearGizmo() { }
  updateGizmo() {
    const { roomType } = this.config;
    if (roomType === "illustration") return;
    const diamondHeight = 10;
    const context = this.inputCanvas.getContext("2d");
    const { width, height } = this.inputCanvas;
    clearCanvas(this.inputCanvas, width, height);
    const gizmoCoordinates = this.threeView.getGizmoCordinates();
    if (!gizmoCoordinates) return;
    let { radX, radY, canvasCenter } = gizmoCoordinates;
    const rgb = {
      r: 250,
      g: 250,
      b: 250,
      a: 0.8
    };
    const colorStr = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + rgb.a + ")";
    var radiusX;
    var radiusY;
    if (radX > radY) {
      radiusX = radX;
      radiusY = radY;
    } else {
      radiusX = radY;
      radiusY = radX;
    }
    // Draw the ellipse
    context.strokeStyle = colorStr;
    context.fillStyle = colorStr;
    context.lineWidth = 1;
    context.shadowOffsetX = 0;
    context.shadowColor = "black";
    context.shadowOffsetY = 1;
    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.ellipse(canvasCenter.x, canvasCenter.y, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.stroke();
    context.beginPath();
    context.moveTo(canvasCenter.x, canvasCenter.y + radiusY - 5);
    context.lineTo(canvasCenter.x + diamondHeight, canvasCenter.y + radiusY);
    context.lineTo(canvasCenter.x, canvasCenter.y + radiusY + 5);
    context.lineTo(canvasCenter.x - diamondHeight, canvasCenter.y + radiusY);
    context.fill();
  }
  resize(newDims) {
    if (!this.config.dims || !this.threeView.renderer) return;
    const containerDims = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.dimensionPixels = resizeKeepingAspect(this.config.dims, containerDims, "fit_inside");
    setCanvasDimensionsStyle(this.bgCanvas, this.dimensionPixels);
    this.threeView.resizeRenderer(this.dimensionPixels);
    setCanvasDimensionsStyle(this.maskCanvas, this.dimensionPixels);
    setCanvasDimensionsStyle(this.shadowCanvas, this.dimensionPixels);
    this.inputCanvas.width = this.dimensionPixels.width;
    this.inputCanvas.height = this.dimensionPixels.height;
    if (this.floatingOptionsContainer) {
      this.floatingOptionsContainer.style.width = `${this.dimensionPixels.width}px`;
      this.floatingOptionsContainer.style.height = `${this.dimensionPixels.height}px`;
    }
    this.updateGizmo();
  }
  renderinCanvas() {
    const { width: w, height: h } = this.dimensionPixels;
    const renderCanvas = createCanvas(w, h);
    const renderCtx = renderCanvas.getContext("2d");
    renderCtx.drawImage(this.bgCanvas, 0, 0, w, h);
    renderCtx.drawImage(this.threeCanvas, 0, 0, w, h);
    renderCtx.drawImage(this.maskCanvas, 0, 0, w, h);
    renderCtx.drawImage(this.shadowCanvas, 0, 0, w, h);
    return renderCanvas;
  }
  downloadRendering(name, mime) {
    const renderCanvas = this.renderinCanvas();
    downloadImageData(renderCanvas, name, mime);
  }
}

function makeMask(canvas, w, h, maskImg, flag = false) {
  const tCanvas = createCanvas(w, h);

  const shCtx = canvas.getContext("2d");
  const tmpCtx = tCanvas.getContext("2d");
  tmpCtx.drawImage(maskImg, 0, 0, w, h);
  let imgData = shCtx.getImageData(0, 0, w, h);
  let maskData = tmpCtx.getImageData(0, 0, w, h);
  for (let i = 0; i < maskData.data.length; i += 4) {
    if (flag) {
      imgData.data[i + 3] = maskData.data[i];
    } else {
      imgData.data[i + 3] = maskData.data[i];
    }
  }
  shCtx.putImageData(imgData, 0, 0);
  return maskData;
}
const setCanvasDimensionsStyle = (canvas, dimensionPixels) => {
  const { width: widthPix, height: heightPix } = dimensionPixels;

  canvas.style.width = `${widthPix}px`;
  canvas.style.height = `${heightPix}px`;
};
const setCanvasDimensions = (canvas, dimension, dimensionPixels) => {
  const { width, height } = dimension;
  const { width: widthPix, height: heightPix } = dimensionPixels;

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${widthPix}px`;
  canvas.style.height = `${heightPix}px`;
};
const normalizeDirNames = files =>
  files.map(item => (item.charAt(0) === "/" ? item.substring(1) : item));
