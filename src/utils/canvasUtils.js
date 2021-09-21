import { readImage } from "./fileUtils";

export const createCanvas = (w, h) => {
  var canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

export function applyEdgeFilter(canvas, image) {
  const pix = 4;
  const blur = "2px";
  const brightness = "50%";

  const w = canvas.width,
    h = canvas.height;

  var designCtx = canvas.getContext("2d");

  var filterCanvas = createCanvas(w, h);
  var designfilterCtx = filterCanvas.getContext("2d");
  designfilterCtx.filter = `blur(${blur}) brightness(${brightness})`;
  designfilterCtx.drawImage(image, 0, 0, w, h);

  const designfilterData = designfilterCtx.getImageData(0, 0, pix, h);
  designCtx.putImageData(designfilterData, 0, 0);

  const designfilterData2 = designfilterCtx.getImageData(0, 0, w, pix);
  designCtx.putImageData(designfilterData2, 0, 0);

  const designfilterData3 = designfilterCtx.getImageData(0, h - pix, w, pix);
  designCtx.putImageData(designfilterData3, 0, h - pix);

  const designfilterData4 = designfilterCtx.getImageData(w - pix, 0, pix, h);
  designCtx.putImageData(designfilterData4, w - pix, 0);
  return canvas;
}
export function applyBWMask(maskCanvas, imageUrl, maskUrl, callback) {
  const { width, height } = maskCanvas;
  const tempCanvas = createCanvas(width, height);
  const maskCtx = maskCanvas.getContext("2d");
  const tempCtx = tempCanvas.getContext("2d");

  const img = new Image();
  img.src = imageUrl;
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    maskCanvas.width = width;
    maskCanvas.height = height;
    maskCtx.drawImage(img, 0, 0, width, height);
    const maskImg = new Image();
    maskImg.src = maskUrl;
    maskImg.crossOrigin = "Anonymous";
    maskImg.onload = () => {
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx.drawImage(maskImg, 0, 0, width, height);

      let imgData = maskCtx.getImageData(0, 0, width, height);
      let maskData = tempCtx.getImageData(0, 0, width, height);

      for (var i = 0; i < maskData.data.length; i += 4) {
        imgData.data[i + 3] = 255 - maskData.data[i];
      }
      maskCtx.putImageData(imgData, 0, 0);
      callback(maskCanvas);
    };
  };
}
export const applyMask = (canvas, imgUrl, maskUrl) => {
  const { width, height } = canvas;
  const tempCanvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const tempCtx = tempCanvas.getContext("2d");

  const readUrls = [readImage(imgUrl), readImage(maskUrl)];
  return Promise.all(readUrls).then((images) => {
    const image = images[0];
    const mask = images[1];

    ctx.drawImage(image, 0, 0, width, height);
    tempCtx.drawImage(mask, 0, 0, width, height);

    let imgData = ctx.getImageData(0, 0, width, height);
    let maskData = tempCtx.getImageData(0, 0, width, height);

    for (let i = 0; i < maskData.data.length; i += 4) {
      imgData.data[i + 3] = 255 - maskData.data[i];
    }
    ctx.putImageData(imgData, 0, 0);
  });
};

export const bnwToTransparency = (canvas, bnwUrl, amount) => {
  const { width, height } = canvas;
  const ctx = canvas.getContext("2d");

  const image = new Image();
  image.src = bnwUrl;
  image.crossOrigin = "Anonymous";
  image.onload = function () {
    ctx.drawImage(image, 0, 0, width, height);

    let imageData = ctx.getImageData(0, 0, width, height);
    for (var i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = (255 - imageData.data[i]) * amount;
      imageData.data[i] = 0;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
  };
};

export const resizeCanvas = (canvas, width, height) => {
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
};
export const clearCanvas = (canvas, w, h) => {
  canvas.getContext("2d").clearRect(0, 0, w, h);
};
export const imagetoBlob = (canvas, image, mime, callback) => {
  const { width, height } = canvas;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  canvas.toBlob(callback, mime, 0.8);
};
export const downloadImageData = (canvas, name, mime) => {
  canvas.toBlob(
    function (blob) {
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.setAttribute("download", name);

      setTimeout(function () {
        anchor.click();
      }, 100);
    },
    mime,
    1
  );
};

export const canvasToBlobPromise = (canvas) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(resolve);
  });

export function getCroppedSize(srcSize, dstSize, cropPadding = 0) {
  let width = dstSize.Width,
    height = dstSize.Height;
  const { Width: canvasWidth, Height: canvasHeight } = srcSize;
  const wr = dstSize.Width / canvasWidth;
  const hr = dstSize.Height / canvasHeight;
  if (wr > hr) {
    if (dstSize.Width > canvasWidth) {
      width = canvasWidth;
      height = (dstSize.Height * width) / dstSize.Width;
    }
  } else {
    if (dstSize.Height > canvasHeight) {
      height = canvasHeight;
      width = (dstSize.Width * height) / dstSize.Height;
    }
  }
  const shouldApplyPad = (width / height).toFixed(1) !== (canvasWidth / canvasHeight).toFixed(1);
  if (shouldApplyPad) {
    width = width - cropPadding;
    height = height - cropPadding;
  }
  width = Math.ceil(width);
  height = Math.ceil(height);
  const offsetX = (width - srcSize.Width) / 2;
  const offsetY = (height - srcSize.Height) / 2;
  return { width, height, offsetX, offsetY };
}

export const cropStitchCanvas = ({ origCanvas, canvas }) => {
  const { width: canvasWidth, height: canvasHeight } = origCanvas;
  const origCtx = origCanvas.getContext("2d");
  const { width, height } = canvas;
  const ctx = canvas.getContext("2d");

  if (width === canvasWidth && height === canvasHeight) {
    ctx.drawImage(origCanvas, 0, 0);
    return;
  }
  const overlapSize = 20;
  const overlapsx = canvasWidth - width / 2 - overlapSize;
  const overlapsy = canvasHeight - height / 2 - overlapSize;
  const wid = width / 2;
  const hgt = height / 2;
  const tl = origCtx.getImageData(0, 0, wid, hgt);
  const tr = origCtx.getImageData(overlapsx, 0, wid + overlapSize, hgt);
  const bl = origCtx.getImageData(0, overlapsy, wid, hgt + overlapSize);
  const br = origCtx.getImageData(overlapsx, overlapsy, wid + overlapSize, hgt + overlapSize);
  const trCanvas = createCanvas(tr.width, tr.height);
  const trCtx = trCanvas.getContext("2d");
  trCtx.putImageData(tr, 0, 0);
  trCtx.globalCompositeOperation = "destination-out";
  let trgrd = trCtx.createLinearGradient(0, 0, overlapSize, 0);
  trgrd.addColorStop(0, "black");
  trgrd.addColorStop(1, "transparent");
  trCtx.fillStyle = trgrd;
  trCtx.fillRect(0, 0, overlapSize, tr.height);
  // document.body.appendChild(trCanvas);

  const blCanvas = createCanvas(bl.width, bl.height);
  const blCt = blCanvas.getContext("2d");
  blCt.putImageData(bl, 0, 0);
  blCt.globalCompositeOperation = "destination-out";
  let blgrd = blCt.createLinearGradient(0, 0, 0, overlapSize);
  blgrd.addColorStop(0, "black");
  blgrd.addColorStop(1, "transparent");
  blCt.fillStyle = blgrd;
  blCt.fillRect(0, 0, bl.width, overlapSize);
  // document.body.appendChild(blCanvas);

  const brCanvas = createCanvas(br.width, br.height);
  const brCt = brCanvas.getContext("2d");
  brCt.putImageData(br, 0, 0);
  brCt.globalCompositeOperation = "destination-out";
  let brgrd = brCt.createLinearGradient(0, 0, 0, overlapSize);
  brgrd.addColorStop(0, "black");
  brgrd.addColorStop(1, "transparent");
  brCt.fillStyle = brgrd;
  brCt.fillRect(0, 0, br.width, overlapSize);

  let brgrd1 = brCt.createLinearGradient(0, 0, overlapSize, 0);
  brgrd1.addColorStop(0, "black");
  brgrd1.addColorStop(1, "transparent");
  brCt.fillStyle = brgrd1;
  brCt.fillRect(0, 0, overlapSize, bl.height);

  ctx.putImageData(tl, 0, 0);
  ctx.drawImage(trCanvas, width - tr.width, 0);
  ctx.drawImage(blCanvas, 0, height - bl.height);
  ctx.drawImage(brCanvas, width - br.width, height - br.height);
};
