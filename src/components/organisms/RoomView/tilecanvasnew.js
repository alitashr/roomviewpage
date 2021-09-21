import { fetchDesignTiles, fetchPileTiles, fetchVisualizationTiles } from "../../../api/appProvider";
import { mergeArraysWithoutDuplicate } from "../../../utils/arrayUtils";
import { convertNameToTilePoint, convertTilePointToName } from "../../../utils/converter";

let requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

const calculateDistance = (pointA, pointB) => {
  const { x: ia, y: ja } = pointA;
  const { x: ib, y: jb } = pointB;
  return Math.sqrt(Math.pow(ia - ib, 2) + Math.pow(ja - jb, 2));
};
export default class TileCanvas {
  constructor(options = {}) {
    const { canvas } = options;
    if (canvas) {
      this.setRenderingCanvas(canvas);
    }
    // this.tileArray = { sources: null, images: null }
    // this.imageLoader = new ImageLoader()
    this.tilePoints = [];
    this.width = null;
    this.height = null;
    this.tilesToUpdate = [];
    this.designTilesToUpdate = [];
    this.normapTilesToUpdate = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.canvas = document.createElement("canvas");
    this.canvasBack = document.createElement("canvas");
    this.canvasNorm = document.createElement("canvas");
    this.canvasVis = document.createElement("canvas");
    // this.canvasNorm.classList.add("test-canvas");
    // document.body.appendChild(this.canvas);
    // document.body.appendChild(this.canvasNorm);
  }

  init(options) {
    const {
      tileSize,
      designDetails,
      zoom,
      felt= window.flags.isFelt ||0,
      offset = [0, 0],
      renderBounds,
      canvasSize = { width: null, height: null }
    } = options;
      
    this.desTilesUpdated = false;
    this.normapTilesUpdated = false;
    this.zoom = zoom;
    this.felt = felt ? 1:0; //felt should be 1 or 0 (not true/false)
    this.tileSize = tileSize;
    this.designDetails = designDetails;
    const { Width, Height } = designDetails;
    const ratio = Width / Height;
    const designWidth = Width * zoom;
    const designHeight = designWidth / ratio;

    let w = designWidth;
    let h = designHeight;

    const { width: canvasWidth, height: canvasHeight } = canvasSize;
    if (canvasWidth) w = canvasWidth;
    if (canvasHeight) h = canvasHeight;
    this.width = w;
    this.height = h;
    const dw = w - designWidth;
    const dh = h - designHeight;

    this.offsetX = dw * offset[0];
    this.offsetY = dh * offset[1];

    this.canvas.width = w;
    this.canvas.height = h;
    this.canvasBack.width = w;
    this.canvasBack.height = h;
    this.canvasNorm.height = h;
    this.canvasNorm.width = w;
    this.canvasVis.height = h;
    this.canvasVis.width = w;

    // const ctx = this.canvas.getContext("2d");
    // ctx.fillStyle = "rgb(0,0,0)";
    // ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    let xOff = 0,
      yOff = 0;
    let tilesWidth = designWidth,
      tilesHeight = designHeight;
    //*important: the points should be multiple of 256 and should not be greater than width of canvas itself
    let p1 = { x: 0, y: 0 };
    let p2 = { x: designWidth, y: designHeight };

    if (renderBounds) {
      const { p1: point1, p2: point2 } = renderBounds;
      if (point1) p1 = point1;
      if (point2) p2 = point2;
    }
    /*
     * * if drawing canvas is smaller, tiles should not start from 0 and not end on design width depending on offset value
     * * if drawing canvas is larger, tiles should start from 0 but drawn on offsetpoint
     */
    if (this.offsetX < 0) {
      // * start drawing tiles from offset point, add bound start point to it
      xOff = this.offsetX - p1.x;
      // * draw tiles till the end of canvas or specified bound
      tilesWidth = p2.x - p1.x;
    } else {
      // * first tile is start point of bound
      xOff = p1.x;
      // * draw till last point of bound
      tilesWidth = p2.x - xOff;
    }
    if (this.offsetY < 0) {
      yOff = this.offsetY - p1.y;
      tilesHeight = p2.y - p1.y;
    } else {
      yOff = p1.y - this.offsetY;
      tilesHeight = p2.y - yOff;
      if (yOff < 0) yOff = 0;
    }
    if (tilesWidth > designWidth) tilesWidth = designWidth - Math.abs(xOff);
    if (tilesHeight > designHeight) tilesHeight = designHeight - Math.abs(yOff);
    const xOffPoint = Math.floor(Math.abs(xOff) / tileSize);
    const yOffPoint = Math.floor(Math.abs(yOff) / tileSize);

    this.xTotal = Math.floor((tilesWidth - 1) / tileSize) + 1 + xOffPoint;
    this.yTotal = Math.floor((tilesHeight - 1) / tileSize) + 1 + yOffPoint;
    this.tilePoints = [];

    for (let x = xOffPoint; x < this.xTotal; x++) {
      for (let y = yOffPoint; y < this.yTotal; y++) {
        this.tilePoints.push({ x, y, name: convertTilePointToName(x, y) });
      }
    }
    this.tilesToUpdate = this.tilePoints;
    this.designTilesToUpdate = this.tilePoints;
    this.normapTilesToUpdate = this.tilePoints;
    this.visTilesToUpdate = this.tilePoints;
    this.fetchNonce = null;
    this.fetchNonce1 = null;
    this.fetchNonce2 = null;
    this.fetchNonce3 = null;
    this.fetchNonce4 = null;
    this.fetchNonce5 = null;
    this.latesttiles = null;
  }
  drawCanvasBackTiles(options = {}, onUpdate, onComplete) {
    const { zoom, felt } = this;
    const { x = 0, y = 0, designPath, designDetails, hash, renderBounds } = options;
    let p1, p2, tilesWidth, tilesHeight, xOff, yOff, xTotal, yTotal, tilePoints;
    const { Width, Height } = designDetails;
    const ratio = Width / Height;
    const designWidth = Width * zoom;
    const designHeight = designWidth / ratio;
    if (renderBounds) {
      const { p1: point1, p2: point2 } = renderBounds;
      if (point1) p1 = point1;
      if (point2) p2 = point2;
    }
    if (this.offsetX < 0) {
      xOff = this.offsetX - p1.x;
      tilesWidth = p2.x - p1.x;
    } else {
      // * first tile is start point of bound
      xOff = p1.x;
      // * draw till last point of bound
      tilesWidth = p2.x - xOff;
    }
    if (this.offsetY < 0) {
      yOff = this.offsetY - p1.y;
      tilesHeight = p2.y - p1.y;
    } else {
      yOff = p1.y - this.offsetY;
      tilesHeight = p2.y - yOff;
      if (yOff < 0) yOff = 0;
    }
    if (tilesWidth > designWidth) tilesWidth = designWidth - Math.abs(xOff);
    if (tilesHeight > designHeight) tilesHeight = designHeight - Math.abs(yOff);
    const xOffPoint = Math.floor(Math.abs(xOff) / this.tileSize);
    const yOffPoint = Math.floor(Math.abs(yOff) / this.tileSize);

    xTotal = Math.floor((tilesWidth - 1) / this.tileSize) + 1 + xOffPoint;
    yTotal = Math.floor((tilesHeight - 1) / this.tileSize) + 1 + yOffPoint;
    tilePoints = [];

    for (let x = xOffPoint; x < xTotal; x++) {
      for (let y = yOffPoint; y < yTotal; y++) {
        tilePoints.push({ x, y, name: convertTilePointToName(x, y) });
      }
    }

    const localNonce = (this.fetchNonce5 = {});
    const ctx = this.canvasBack.getContext("2d");
    const backTextureMaterialIndex = 4;
    let newDesignColors = [];
    designDetails.DesignColors.forEach((designColor, index) => {
      let newYarnDetails = [];
      designColor.YarnDetails.forEach((yarnDetails, yarnIndex) => {
        newYarnDetails.push({ ...yarnDetails, Material: backTextureMaterialIndex });
      });
      newDesignColors.push({
        ...designColor,
        Material: backTextureMaterialIndex,
        YarnDetails: [...newYarnDetails]
      });
    });

    const pivot = {
      x: Math.round((xOffPoint + xTotal) / 2),
      y: Math.round((yOffPoint + yTotal) / 2)
    };

    if (tilePoints.length) {
      //calculate distance from pivot point of each point
      const tileVec = tilePoints.map(tile => ({
        ...tile,
        dist: calculateDistance(tile, pivot)
      }));
      tileVec.sort((a, b) => (a.dist > b.dist ? 1 : -1));

      const designTileNamesinVp = tileVec.map(tile => tile.name);
      const designApiProps = {
        file: designPath,
        zoom,
        tiles: designTileNamesinVp,
        props: { ...designDetails, DesignColors: [...newDesignColors] },
        hash,
        felt
      };

      fetchDesignTiles(designApiProps).then(baseDesignPath => {
        if (localNonce !== this.fetchNonce5) return;
        let tileImagesLoaded = 0;
        tileVec.forEach((tilePoint, index) => {
          const { name: tileName } = tilePoint;
          let filename = `${baseDesignPath}/${tileName}.jpg?t=${hash}`;
          const img = document.createElement("img");
          img.setAttribute("crossOrigin", "Anonymous");
          img.src = filename;
          tilePoint.image = img;
          img.onload = () => {
            if (localNonce !== this.fetchNonce5) return;
            drawSingleTileInDesignCanvas(index);
            if (tileImagesLoaded + 1 === tileVec.length) {
              onComplete();
            }
            tileImagesLoaded++;
          };
        });

        const drawSingleTileInDesignCanvas = index => {
          const tilepoint = tileVec[index];
          const startX = tilepoint.x * this.tileSize + this.offsetX;
          const startY = tilepoint.y * this.tileSize + this.offsetY;
          ctx.drawImage(tilepoint.image, startX, startY);
        };
      });
    }
  }
  drawCanvasTiles(options = {}, onUpdate, onComplete) {
    const { xTotal, yTotal, zoom, felt } = this;
    const {
      x = 0,
      y = 0,
      endX = xTotal,
      endY = yTotal,
      designPath,
      designDetails,
      drawNormap = true,
      hash,
      tileTransparency = []
    } = options;
    const localNonce = (this.fetchNonce = {});
    const ctx = this.canvas.getContext("2d");
    const ctxnorm = this.canvasNorm.getContext("2d");
    const { startX, startY, endpointX, endpointY } = this.getStartEndPoints(x, y, endX, endY);

    const designTilesinVp = felt ?  this.designTilesToUpdate: this.designTilesToUpdate.filter(point => {
      const { x, y } = point;
      return x >= startX && y >= startY && x <= endpointX && y <= endpointY;
    });
    const pivot = {
      x: Math.round((startX + endpointX) / 2),
      y: Math.round((startY + endpointY) / 2)
    };
    //tiles not in vp
    const designTilesNotinVp = this.designTilesToUpdate.filter(
      tile => !designTilesinVp.includes(tile)
    );
    this.designTilesToUpdate = designTilesNotinVp;

    const normapTilesinVp = this.normapTilesToUpdate.filter(point => {
      const { x, y } = point;
      return x >= startX && y >= startY && x <= endpointX && y <= endpointY;
    });
    const normapTilesNotinVp = this.normapTilesToUpdate.filter(
      tile => !normapTilesinVp.includes(tile)
    );
    this.normapTilesToUpdate = normapTilesNotinVp;
    // let designsLoaded = false, normapsloaded = false

    if (designTilesinVp.length) {
      //calculate distance from pivot point of each point
      const tileVec = designTilesinVp.map(tile => ({
        ...tile,
        dist: calculateDistance(tile, pivot)
      }));
      tileVec.sort((a, b) => (a.dist > b.dist ? 1 : -1));

      const designTileNamesinVp = tileVec.map(tile => tile.name);
      const designApiProps = {
        file: designPath,
        zoom,
        tiles: designTileNamesinVp,
        props: designDetails,
        hash,
        felt
      };
      let designtilescomplete = false;
      let normaptilescomplete = !drawNormap;

      const checkComplete = () => {
        if (designtilescomplete && normaptilescomplete) {
          if (tileTransparency.length) {
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(this.canvasNorm, 0, 0);
          } else {
            ctx.globalCompositeOperation = "source-over";
          }
          // readImage("Ageiborothes.jpg").then(img => {
          //   ctx.drawImage(img, 0, 0)
          //   onComplete();
          // })
          onComplete();
        }
      };
      const drawNormalMaps = () => {
        if (normapTilesinVp.length && drawNormap) {
          const designTileNamesinVp = designTilesinVp.map(tile => tile.name);
          const designApiProps = {
            file: designPath,
            zoom,
            tiles: designTileNamesinVp,
            props: designDetails,
            hash
          };
          fetchPileTiles(designApiProps).then((baseNormapPath, index) => {
            if (localNonce !== this.fetchNonce) return;
            let tileImagesLoaded = 0;
            normapTilesinVp.forEach(async (tilePoint, index) => {
              const { name: tileName } = tilePoint;
              let filename = `${baseNormapPath}/${tileName}.png?t=${hash}`;
              const img = document.createElement("img");
              img.setAttribute("crossOrigin", "Anonymous");
              img.src = filename;
              tilePoint.image = img;
              img.onload = () => {
                if (localNonce !== this.fetchNonce) return;
                drawSingleTileInNormapCanvas(index);
                if (tileImagesLoaded + 1 === normapTilesinVp.length) {
                  drawFinishNormap();
                }
                tileImagesLoaded++;
              };
            });
            const drawSingleTileInNormapCanvas = index => {
              const tilepoint = normapTilesinVp[index];
              const startX = tilepoint.x * this.tileSize + this.offsetX;
              const startY = tilepoint.y * this.tileSize + this.offsetY;
              ctxnorm.drawImage(tilepoint.image, startX, startY);
            };
            const drawFinishNormap = () => {
              normaptilescomplete = true;
              checkComplete();
            };
          });
        }
      };

      fetchDesignTiles(designApiProps).then(baseDesignPath => {
        if (localNonce !== this.fetchNonce) return;
        let tileImagesLoaded = 0;
        tileVec.forEach((tilePoint, index) => {
          const { name: tileName } = tilePoint;
          let filename = `${baseDesignPath}/${tileName}${
            window.InterfaceElements.IsJpeg ? ".rendered" : ""
          }.jpg?t=${hash}`;
          const img = document.createElement("img");
          img.setAttribute("crossOrigin", "Anonymous");
          img.src = filename;
          tilePoint.image = img;
          img.onload = () => {
            if (localNonce !== this.fetchNonce) return;
            drawSingleTileInDesignCanvas(index);
            if (tileImagesLoaded + 1 === tileVec.length) {
              drawFinishDesignTiles();
            }
            tileImagesLoaded++;
          };
        });

        const drawSingleTileInDesignCanvas = index => {
          const tilepoint = tileVec[index];
          const startX = tilepoint.x * this.tileSize + this.offsetX;
          const startY = tilepoint.y * this.tileSize + this.offsetY;
          ctx.drawImage(tilepoint.image, startX, startY);
        };
        const drawFinishDesignTiles = () => {
          if (!drawNormap) {
            ctxnorm.fillStyle = "rgb(127,127,255)";
            ctxnorm.fillRect(0, 0, this.canvasNorm.width, this.canvasNorm.height);
            designtilescomplete = true;
            checkComplete();
            return;
          }
          designtilescomplete = true;
          checkComplete();
        };
      });
      if (localNonce !== this.fetchNonce) return;
      if (drawNormap) {
        drawNormalMaps();
      }
    }
  }
  drawVisTiles(options, onComplete) {
    const { xTotal, yTotal, zoom, felt } = this;
    const {
      x = 0,
      y = 0,
      endX = xTotal,
      endY = yTotal,
      designPath,
      designDetails,
      hash,
      forceOriginalDesigns
    } = options;
    let localNonce = (this.fetchNonce4 = {});
    const ctxVis = this.canvasVis.getContext("2d");
    const { startX, startY, endpointX, endpointY } = this.getStartEndPoints(x, y, endX, endY);
    const visTilesinVP = this.designTilesToUpdate.filter(point => {
      const { x, y } = point;
      return x >= startX && y >= startY && x <= endpointX && y <= endpointY;
    });
    const pivot = {
      x: Math.round((startX + endpointX) / 2),
      y: Math.round((startY + endpointY) / 2)
    };
    if (visTilesinVP.length) {
      const tileVec = visTilesinVP.map(tile => ({
        ...tile,
        dist: calculateDistance(tile, pivot)
      }));
      tileVec.sort((a, b) => (a.dist > b.dist ? 1 : -1));

      const apiProps = {
        file: designPath,
        zoom,
        tiles: tileVec.map(tile => tile.name),
        props: forceOriginalDesigns ? null : designDetails,
        hash,
        felt
      };
      fetchVisualizationTiles(apiProps).then(basePath => {
        if (localNonce !== this.fetchNonce4) return;
        let tileImagesLoaded = 0;
        tileVec.forEach(async (tilePoint, index) => {
          const { name: tileName } = tilePoint;
          let filename = `${basePath}/${tileName}.rendered.jpg?t=${hash}`;
          const img = document.createElement("img");
          img.setAttribute("crossOrigin", "Anonymous");
          img.src = filename;
          tilePoint.image = img;
          img.onload = () => {
            if (localNonce !== this.fetchNonce4) return;
            drawSingleTileInCanvas(index);
            if (tileImagesLoaded + 1 === tileVec.length) {
              onComplete();
              return;
            }
            tileImagesLoaded++;
          };
        });
        const drawSingleTileInCanvas = index => {
          const tilepoint = tileVec[index];
          const startX = tilepoint.x * this.tileSize + this.offsetX;
          const startY = tilepoint.y * this.tileSize + this.offsetY;
          ctxVis.drawImage(tilepoint.image, startX, startY);
        };
      });
    }
    //tiles not in vp
    const designTilesNotinVp = this.designTilesToUpdate.filter(
      tile => !visTilesinVP.includes(tile)
    );
    this.designTilesToUpdate = designTilesNotinVp;
  }
  updateVisTiles(options, onComplete) {
    const { xTotal, yTotal, felt } = this;
    const {
      x,
      y,
      endX = xTotal,
      endY = yTotal,
      tiles,
      zoom,
      designPath,
      designDetails,
      hash
    } = options;
    let tilePoints;
    let localNonce = (this.fetchNonce3 = {});
    if (tiles) tilePoints = tiles.map(item => ({ ...convertNameToTilePoint(item), item }));
    else tilePoints = this.tilePoints;
    const { startX, startY, endpointX, endpointY } = this.getStartEndPoints(x, y, endX, endY);
    const tilesinVp = tilePoints.filter(point => {
      const { x, y } = point;
      return x >= startX && y >= startY && x <= endpointX && y <= endpointY;
    });
    const tileNamesVp = tilesinVp.map(tile => convertTilePointToName(tile.x, tile.y));
    const tilesNotInVp = tilePoints.filter(n => !tilesinVp.includes(n));
    this.visTilesToUpdate = mergeArraysWithoutDuplicate(this.visTilesToUpdate, tilesNotInVp);
    const ctx = this.canvas.getContext("2d");

    fetchVisualizationTiles({
      file: designPath,
      zoom,
      tiles: tileNamesVp,
      props: designDetails,
      hash,
      felt
    }).then(baseDesignPath => {
      if (localNonce !== this.fetchNonce3) return;
      tilesinVp.forEach(async (tilePoint, index) => {
        const { name: tileName } = tilePoint;
        let filename = `${baseDesignPath}/${tileName}.rendered.jpg`;
        if (hash) {
          filename = `${filename}?t=${hash}`;
        }
        const img = document.createElement("img");
        img.setAttribute("crossOrigin", "Anonymous");
        img.src = filename;
        tilePoint.image = img;
        img.onload = () => {
          if (localNonce !== this.fetchNonce3) return;
          if (index + 1 === tilesinVp.length) {
            drawInDesignCanvas();
          }
        };
      });
      let designTileIndex = 0;
      let desAnimFrame;
      const drawInDesignCanvas = () => {
        if (designTileIndex < tilesinVp.length) {
          if (localNonce !== this.fetchNonce3) return;
          const tilepoint = tilesinVp[designTileIndex];
          ctx.drawImage(tilepoint.image, tilepoint.x * this.tileSize, tilepoint.y * this.tileSize);
          desAnimFrame = requestAnimationFrame(drawInDesignCanvas);
        }
        if (designTileIndex === tilesinVp.length) {
          cancelAnimationFrame(desAnimFrame);
          onComplete();
        }
        designTileIndex++;
      };
    });
  }
  updateDesignTiles(options, onUpdate, onComplete) {
    const { xTotal, yTotal, felt } = this;
    const {
      x,
      y,
      endX = xTotal,
      endY = yTotal,
      tiles,
      zoom,
      designPath,
      designDetails,
      hash,
      tileTransparency = []
    } = options;
    const localNonce = (this.fetchNonce1 = {});
    let tilePoints;
    if (tiles) tilePoints = tiles.map(name => ({ ...convertNameToTilePoint(name), name }));
    else tilePoints = this.tilePoints;
    const { startX, startY, endpointX, endpointY } = this.getStartEndPoints(x, y, endX, endY);
    
    const tilesinVp = felt ? tilePoints : tilePoints.filter(point => {
      const { x, y } = point;
      return x >= startX && y >= startY && x <= endpointX && y <= endpointY;
    });
    const tileNamesVp = tilesinVp.map(tile => convertTilePointToName(tile.x, tile.y));
    const tilesNotInVp = tilePoints.filter(n => !tilesinVp.includes(n));
    this.designTilesToUpdate = mergeArraysWithoutDuplicate(this.designTilesToUpdate, tilesNotInVp);
    const ctx = this.canvas.getContext("2d");
    this.latesttiles = [...tileNamesVp];
    fetchDesignTiles({
      file: designPath,
      zoom,
      tiles: tileNamesVp,
      props: designDetails,
      hash,
      felt
    }).then(baseDesignPath => {
      const issamecolornumber = JSON.stringify(this.latesttiles) === JSON.stringify(tileNamesVp);
      if (issamecolornumber && localNonce !== this.fetchNonce1) return;
      let loadcount = 0;
      const latesttiles = this.latesttiles;
      const uniquetilesinvp = issamecolornumber
        ? tilesinVp
        : tilesinVp.filter(function(tile) {
            return !latesttiles.includes(tile.name);
          });
      uniquetilesinvp.forEach(async (tilePoint, index) => {
        const { name: tileName } = tilePoint;
        let filename = `${baseDesignPath}/${tileName}.jpg`;
        if (hash) {
          filename = `${filename}?t=${hash}`;
        }
        const img = document.createElement("img");
        img.setAttribute("crossOrigin", "Anonymous");
        img.src = filename;
        tilePoint.image = img;
        img.onload = () => {
          loadcount++;
          if (loadcount === uniquetilesinvp.length) {
            checkAndDrawInDesignCanvas();
          }
        };
      });
      let finaldrawingtiles;
      const checkAndDrawInDesignCanvas = () => {
        const latesttiles = this.latesttiles;
        finaldrawingtiles =
          localNonce === this.fetchNonce1
            ? uniquetilesinvp
            : uniquetilesinvp.filter(function(tile) {
                return !latesttiles.includes(tile.name);
              });
        drawInDesignCanvas();
      };

      let designTileIndex = 0;
      let desAnimFrame;
      ctx.globalCompositeOperation = "source-over";
      const drawInDesignCanvas = () => {
        if (designTileIndex < finaldrawingtiles.length) {
          // if (localNonce !== this.fetchNonce1) return
          const tilepoint = finaldrawingtiles[designTileIndex];
          ctx.drawImage(tilepoint.image, tilepoint.x * this.tileSize, tilepoint.y * this.tileSize);
          designTileIndex++;
          desAnimFrame = requestAnimationFrame(drawInDesignCanvas);
        }
        if (designTileIndex === finaldrawingtiles.length) {
          if (tileTransparency.length) {
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(this.canvasNorm, 0, 0);
          }
          cancelAnimationFrame(desAnimFrame);
          onComplete();
        }
      };
    });
  }
  updateNormapTiles(options, onUpdate, onComplete) {
    const { xTotal, yTotal } = this;
    const {
      x,
      y,
      endX = xTotal,
      endY = yTotal,
      tiles,
      zoom,
      designPath,
      designDetails,
      hash = ""
    } = options;
    const localNonce = (this.fetchNonce2 = {});
    const ctxNorm = this.canvasNorm.getContext("2d");
    let tilePoints;
    if (tiles) tilePoints = tiles.map(item => convertNameToTilePoint(item));
    else tilePoints = this.tilePoints;
    const { startX, startY, endpointX, endpointY } = this.getStartEndPoints(x, y, endX, endY);
    const tilesinVp = tilePoints.filter(point => {
      const { x, y } = point;
      return x >= startX && y >= startY && x <= endpointX && y <= endpointY;
    });
    this.normapTilesUpdated = true;
    const tileNamesVp = tilesinVp.map(tile => convertTilePointToName(tile.x, tile.y));

    const tilesNotInVp = tilePoints.filter(n => !tilesinVp.includes(n));
    this.normapTilesToUpdate = mergeArraysWithoutDuplicate(this.normapTilesToUpdate, tilesNotInVp);

    fetchPileTiles({
      file: designPath,
      zoom,
      tiles: tileNamesVp,
      props: designDetails,
      hash
    }).then(baseNormalPath => {
      if (localNonce !== this.fetchNonce2) return;

      tilesinVp.forEach(async (tilePoint, index) => {
        const { name: tileName } = tilePoint;
        let filename = `${baseNormalPath}/${tileName}.png`;
        if (hash) {
          filename = `${filename}?t=${hash}`;
        }
        const img = document.createElement("img");
        img.setAttribute("crossOrigin", "Anonymous");
        img.src = filename;
        tilePoint.image = img;
        img.onload = () => {
          if (localNonce !== this.fetchNonce2) return;
          if (index + 1 === tilesinVp.length) {
            drawInDesignCanvas();
          }
        };
      });
      let designTileIndex = 0;
      let desAnimFrame;
      const drawInDesignCanvas = () => {
        if (designTileIndex < tilesinVp.length) {
          if (localNonce !== this.fetchNonce2) return;
          const tilepoint = tilesinVp[designTileIndex];
          ctxNorm.drawImage(
            tilepoint.image,
            tilepoint.x * this.tileSize,
            tilepoint.y * this.tileSize
          );
          desAnimFrame = requestAnimationFrame(drawInDesignCanvas);
        }
        if (designTileIndex === tilesinVp.length) {
          cancelAnimationFrame(desAnimFrame);
          onComplete();
        }
        designTileIndex++;
      };
    });
  }

  getStartEndPoints(x, y, endX, endY) {
    const { xTotal, yTotal } = this;

    let startX = x >= 0 ? x : 0;
    let startY = y >= 0 ? y : 0;

    return {
      startX,
      startY,
      endpointX: endX > xTotal ? xTotal : endX,
      endpointY: endY > yTotal ? yTotal : endY
    };
  }
}
